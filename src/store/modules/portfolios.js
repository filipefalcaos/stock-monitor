import { remote } from 'electron'
import { nanoid } from 'nanoid'
import { NotificationProgrammatic } from 'buefy'
import { utils } from '../../utils'
import axios from 'axios'
import path from 'path'
const fs = require('fs')

const state = () => ({
  dataFileName: '',  // The data filename
  finalResult: 0,    // Sum of results (excluding dividends received) on the selected portfolio
  finalDividends: 0, // Sum of dividends received on the selected portfolio
  portfolioData: {}, // Data loaded from the data file
  dividendsData: {}, // Latest history of dividends (all portfolios)
  priceData: {}      // Latest prices of assets (all portfolios)
})

const getters = {
  // Gets all the assets in any positions of any portfolio
  allAssets: (state) => {
    return [...new Set(state.portfolioData.portfolios.map(port => port.positions.map(p => {
      return JSON.stringify({ asset: p.asset, assetType: p.assetType })
    })).flat())]
  },

  // Gets all the assets in the current portoflio
  currentAssets: (state, getters) => {
    return [...new Set(getters.currentPositions.map(p => {
      return JSON.stringify({ asset: p.asset, assetType: p.assetType })
    }))]
  },

  // Gets the current amount of capital invested (open positions)
  activeInvestment: (state, getters) => {
    return getters.openPositions.reduce((total, position) => {
      return total + position.initialPrice * position.amount
    }, 0)
  },

  // Gets the last portfolio used in the app
  lastPortfolio: (state) => findPortfolios(state, state.portfolioData.lastPortfolio)[0],

  // Gets all the portfolios except for the last acessed one
  otherPortfolios: (state) => findPortfolios(state, state.portfolioData.lastPortfolio, diffFn),

  // Gets the positions of the current portfolio
  currentPositions: (state, getters) => getters.lastPortfolio.positions,

  // Gets the open positions of the current portfolio
  openPositions: (state, getters) => getters.currentPositions.filter(position => !position.closed),

  // Gets the closed positions of the current portfolio
  closedPositions: (state, getters) => getters.currentPositions.filter(position => position.closed),

  // Gets the dividends received for the positions of the current portfolio
  receivedDividends: (state, getters) => getters.lastPortfolio.dividendsReceived,

  // Gets whether the app is empty (no portfolios) or not
  isEmpty: (state) => state.portfolioData.portfolios.length === 0
}

const actions = {
  // Gets, from Yahoo Finance, the latest price data of the given assets. The requests for every
  // asset are made in parallel 
  getAssetsPrices({ commit }, assetList) {
    commit('set', ['isLoading', true])
    commit('set', ['hasError', false])
    
    // Gets the most recent price of each asset from Yahoo Finance
    let promises = []    
    assetList.forEach(s => {
      let parsed = JSON.parse(s)
      promises.push(
        axios
          .get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + parsed.asset + '?modules=price')
          .then(response => response.data)
      )
    })

    return Promise.all(promises)
  },

  // Gets, from Status Invest, the latest history of dividends of the given assets. The requests for every
  // asset are made in parallel 
  getDividendsHistory({ commit }, assetList) {
    commit('set', ['isLoading', true])
    commit('set', ['hasError', false])
    
    // Gets the history of dividends for each asset from Status Invest
    let promises = []
    assetList.forEach(s => {
      let parsed = JSON.parse(s)
      let url = 'https://statusinvest.com.br/' + (parsed.assetType === 'fii' ? 'fundos-imobiliarios/' : 'acoes/')
      promises.push(
        axios
          .get(url + parsed.asset.replace('.SA', ''))
          .then(response => { return { asset: parsed.asset, data: response.data } })
      )
    })

    return Promise.all(promises)
  },

  // Gets the price and the dividends data of the given assets
  async getAssetsData({ commit, dispatch }, assetList) {
    let priceData, dividendData
    
    try {
      priceData = await dispatch('getAssetsPrices', assetList)
      dividendData = await dispatch('getDividendsHistory', assetList)

      // Updates the data in the global state
      commit('setPriceData', priceData)
      commit('setAssetPrices')
      commit('setDividendData', dividendData)
      commit('setReceivedDividends')
      dispatch('updateUI') // Updates the UI
    } catch (err) {
      console.log(err)
      commit('set', ['hasError', true])
      commit('set', ['isLoading', false])
      
      // Display an error message
      NotificationProgrammatic.open({
        duration: 5000,
        message: 'Falha ao obter as cotações de ações ou registros de dividendos. Por favor, cheque sua conexão.',
        position: 'is-bottom-right',
        type: 'is-danger'
      })
    }
  },

  // Updates the UI to reflect that the app has successfully received assets data
  updateUI({ commit, rootState }) {
    if (rootState.appCreated) commit('set', ['appCreated', false], { root: true })
    commit('set', ['isLoading', false])
    commit('set', ['hasNewData', true])
    setTimeout(() => { commit('set', ['hasNewData', false]) }, 2000)
  }
}

const mutations = {
  // Sets the default portfolios data filename
  setDataFileName(state) {
    const dataPath = '/portfolio-data.json'
    state.dataFileName = path.join(remote.app.getPath('userData'), dataPath)
  },

  // Loads the content of the portfolios data file. If no file can be found, a new empty data file
  // is created
  loadDataFile(state) {
    try {
      if (fs.existsSync(state.dataFileName)) {
        state.portfolioData = JSON.parse(fs.readFileSync(state.dataFileName))
      } else {
        state.portfolioData = {
          lastPortfolio: null,
          portfolios: []
        }

        fs.writeFileSync(state.dataFileName, JSON.stringify(state.portfolioData))
      }
    } catch (error) {
      error /* Unused */
    }
  },

  // Updates the content of the portfolios data file by completely overwritting it with the new
  // portofios data
  updateDataFile(state) {
    let portfolioCopy = JSON.parse(JSON.stringify(state.portfolioData))

    // Delete fields that should not be persisted
    // Also, if there is no "asset" defined on the position, set it to "stock"
    portfolioCopy.portfolios.forEach(portfolio => {
      portfolio.positions.forEach(position => {
        delete position.var
        delete position.varpct

        if (!position.closed) {
          delete position.result
          delete position.resultpct
          delete position.currentPrice
        }

        if (!position.asset) position.asset = 'stock'
      })
    })

    fs.writeFileSync(state.dataFileName, JSON.stringify(portfolioCopy, null, 2))
  },

  // Creates a new portfolio and pushes it to the app's state
  newPortfolio(state, portfolioName) {
    state.finalResult = 0
    state.finalDividends = 0
    state.portfolioData.lastPortfolio = nanoid()
    
    state.portfolioData.portfolios.push({
      id: state.portfolioData.lastPortfolio,
      name: portfolioName,
      createdAt: Date.now(),
      positions: []
    })
  },

  // Edits the name of an existing portfolio
  editPortfolio(state, payload) {
    let currPortfolio = findPortfolios(state, payload.id)[0]
    currPortfolio.name = payload.name
  },

  // Deletes an existing portfolio from the portfolios data and updates the last portfolio
  // indicator
  deletePortfolio(state, portfolioId) {
    state.portfolioData.portfolios = state.portfolioData.portfolios.filter(portfolio => portfolio.id !== portfolioId)
    
    if (state.portfolioData.portfolios.length > 0) {
      state.portfolioData.lastPortfolio = state.portfolioData.portfolios[0].id
    } else {
      state.portfolioData.lastPortfolio = null
    }
  },

  // Creates a new position and pushes it to the current portfolio positions
  addPosition(state, positionData) {
    let lastPortfolio = findPortfolios(state, state.portfolioData.lastPortfolio)[0]
    lastPortfolio.positions.push({
      id: nanoid(),
      asset: positionData.asset,
      initialPrice: positionData.initialPrice,
      amount: positionData.amount,
      assetType: positionData.assetType,
      direction: positionData.direction,
      createdAt: Date.now(),
      closed: false
    })
  },

  // Closes (partially or completelly) an existing position in the current portfolio
  closePosition(state, closeObj) {
    let lastPortfolio = findPortfolios(state, state.portfolioData.lastPortfolio)[0]

    // Checks if a new position must be created and closed (partial closing), or just close
    // the existing one
    if (closeObj.newAmount === closeObj.oldPosition.amount) {
      lastPortfolio.positions.forEach(position => {
        if (position.id === closeObj.oldPosition.id) {
          position.closed = true
          position.closePrice = closeObj.closePrice
          position.closedAt = Date.now()
          return
        }
      })
    } else {
      let diff = closeObj.oldPosition.amount - closeObj.newAmount

      // Updates the remaining amount
      lastPortfolio.positions.forEach(position => {
        if (position.id === closeObj.oldPosition.id) {
          position.amount = diff
          return
        }
      })

      // Adds a new position to partially close
      lastPortfolio.positions.push({
        id: nanoid(),
        asset: closeObj.oldPosition.asset,
        assetType: closeObj.oldPosition.assetType,
        initialPrice: closeObj.oldPosition.initialPrice,
        amount: closeObj.newAmount,
        direction: closeObj.oldPosition.direction,
        closed: true,
        createdAt: closeObj.oldPosition.createdAt,
        closedAt: Date.now(),
        closePrice: closeObj.closePrice,
        currentPrice: closeObj.closePrice
      })
    }
  },

  // Deletes an existing position from the current portfolio
  deletePosition(state, positions) {
    let lastPortfolio = findPortfolios(state, state.portfolioData.lastPortfolio)[0]
    lastPortfolio.positions = lastPortfolio.positions.filter(position => !positions.includes(position))
  },

  // Moves an existing position from the current portfolio by pushing it to a new portfolio, and
  // then deleting it from the current one
  movePosition(state, moveObj) {
    let lastPortfolio = findPortfolios(state, state.portfolioData.lastPortfolio)[0]
    let newPortfolio = findPortfolios(state, moveObj.portfolio)[0]
    newPortfolio.positions.push(moveObj.position)
    lastPortfolio.positions = lastPortfolio.positions.filter(position => ![moveObj.position].includes(position))
  },

  // Sets a dictionary of the latest asset prices in the state
  setPriceData(state, priceData) {
    priceData.forEach(s => {
      state.priceData[s.quoteSummary.result[0].price.symbol] = {
        price: s.quoteSummary.result[0].price.regularMarketPrice.raw,
        var: s.quoteSummary.result[0].price.regularMarketChange.raw,
        varpct: s.quoteSummary.result[0].price.regularMarketChangePercent.raw
      }
    })
  },

  // Sets the latest asset prices for each position of all portfolios 
  setAssetPrices(state) {
    state.portfolioData.portfolios.forEach(portfolio => {
      let sum = 0
      portfolio.positions.forEach(p => {
        if (p.asset in state.priceData) {
          p.var = state.priceData[p.asset].var
          p.varpct = state.priceData[p.asset].varpct
          p.currentPrice = p.closed ? p.closePrice : state.priceData[p.asset].price
          
          // Compute the position result
          let diff = p.currentPrice - p.initialPrice
          p.result = (p.direction === 'long') ? diff * p.amount : -diff * p.amount
          p.resultpct = p.result / (p.initialPrice * p.amount)
          sum += p.result
        }
      })

      // Sets the final result only for the current portfolio
      if (portfolio.id === state.portfolioData.lastPortfolio)
        state.finalResult = sum
    })
  },

  // Sets a dictionary of the dividends history of assets in the state
  setDividendData(state, dividendsData) {
    dividendsData.forEach(d => {
      let parser = new DOMParser()
      let doc = parser.parseFromString(d.data, 'text/html')
      let results = JSON.parse(doc.getElementById('results').value)
      
      let dividends = []
      results.forEach(r => {
        let divType = ''
        if (r.etd === 'Dividendo') {
          divType = 'div'
        } else if (r.etd === 'Juros Sobre Capital Próprio') {
          divType = 'jcp'
        } else {
          divType = 'other'
        }

        dividends.push({
          ed: utils.toTimestamp(r.ed),
          pd: utils.toTimestamp(r.pd),
          value: r.v,
          type: divType,
          typeTxt: r.etd
        })
      })
      
      state.dividendsData[d.asset] = dividends
    })
  },

  // Sets the latest dividends received for each position of all portfolios. A dividend is
  // received if a position's time interval contains the ex-dividends date
  setReceivedDividends(state) {
    state.finalDividends = 0
    state.portfolioData.portfolios.forEach(portfolio => {
      portfolio.dividendsReceived = []
      portfolio.positions.forEach(p => {
        if (p.asset in state.dividendsData) {
          let dividendData = state.dividendsData[p.asset]
          p.dividends = 0
          
          // Finds all the dividends received for the current position
          dividendData.forEach(d => {
            let finalDate = p.closed ? p.closedAt : Date.now()
            let key = d.ed.toString().concat(d.pd.toString(), p.asset, d.typeTxt.split(' ')[0])
            if (utils.isInInterval(d.ed, p.createdAt, finalDate)) {
              p.dividends += p.amount * d.value
              portfolio.dividendsReceived.push({
                asset: p.asset,
                amount: p.amount,
                result: p.amount * d.value,
                key: key,
                ...d
              })
            }
          })
        }

        if (portfolio.id === state.portfolioData.lastPortfolio)
          state.finalDividends += p.dividends
      })
      
      // Looks for repeated dividends (more than one position eligible for a dividend)
      let finalDividends = []
      let groupedDividends = groupBy(portfolio.dividendsReceived, 'key')
      
      for (const value of Object.entries(groupedDividends)) {
        let [amount, result, dividend] = [0, 0, null]
        value[1].forEach(v => { amount += v.amount; result += v.result })
        dividend = JSON.parse(JSON.stringify(value[1][0]))
        dividend.amount = amount
        dividend.result = result
        dividend.positions = value[1].length
        finalDividends.push(dividend)
      }

      portfolio.dividendsReceived = finalDividends
    })
  }
}

const equalsFn = (a, b) => a === b
const diffFn = (a, b) => a !== b

// Groups an array of objects by a given key
function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

// Finds a portfolio of a given ID on the list of portfolios stored in the state
function findPortfolios(state, id, matchFn = equalsFn) {
  return state.portfolioData.portfolios.filter(portfolio => matchFn(portfolio.id, id))
}

export default {
  state,
  getters,
  actions,
  mutations
}
