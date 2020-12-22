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
  stocksData: {}     // Latest prices of stocks (all portfolios)
})

const getters = {
  // Gets all the stocks in any positions of any portfolio
  allStocks: (state) => {
    return [...new Set(state.portfolioData.portfolios.map(port => port.positions.map(p => {
      return JSON.stringify({ stock: p.stock, asset: p.asset })
    })).flat())]
  },

  // Gets all the stocks in the current portoflio
  currentStocks: (state, getters) => {
    return [...new Set(getters.currentPositions.map(p => {
      return JSON.stringify({ stock: p.stock, asset: p.asset })
    }))]
  },

  // Gets the current amount of capital invested (open positions)
  activeInvestment: (state, getters) => {
    return getters.openPositions.reduce((total, position) => {
      return total + position.initial_price * position.amount
    }, 0)
  },

  // Gets the last portfolio used in the app
  lastPortfolio: (state) => findPortfolio(state, state.portfolioData.last_portfolio),

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
  // Gets, from Yahoo Finance, the latest price data of the given stocks
  // Requests for every stock are made in parallel 
  getStockPrices({ commit }, stocksList) {
    commit('set', ['isLoading', true])
    commit('set', ['hasError', false])
    
    // Gets the most recent price of each stock from Yahoo Finance
    let promises = []    
    stocksList.forEach(s => {
      let parsed = JSON.parse(s)
      promises.push(
        axios
          .get('https://query2.finance.yahoo.com/v10/finance/quoteSummary/' + parsed.stock + '?modules=price')
          .then(response => response.data)
      )
    })

    return Promise.all(promises)
  },

  // Gets, from Status Invest, the latest history of dividends of the given stocks
  // Requests for every stock are made in parallel 
  getDividendsHistory({ commit }, stocksList) {
    commit('set', ['isLoading', true])
    commit('set', ['hasError', false])
    
    // Gets the history of dividends for each stock from Status Invest
    let promises = []
    stocksList.forEach(s => {
      let parsed = JSON.parse(s)
      let url = 'https://statusinvest.com.br/' + (parsed.asset === 'fii' ? 'fundos-imobiliarios/' : 'acoes/')
      promises.push(
        axios
          .get(url + parsed.stock.replace('.SA', ''))
          .then(response => { return { stock: parsed.stock, data: response.data } })
      )
    })

    return Promise.all(promises)
  },

  // Gets the price and the dividends data of the given stocks
  async getStocksData({ commit, dispatch }, stocksList) {
    let priceData, dividendData
    
    try {
      priceData = await dispatch('getStockPrices', stocksList)
      dividendData = await dispatch('getDividendsHistory', stocksList)

      // Updates the data in the global state
      commit('setStocksData', priceData)
      commit('setStockPrices')
      commit('setDividendData', dividendData)
      commit('setReceivedDividends')
      dispatch('updateUI') // Updates the UI
    } catch (err) {
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

  // Updates the UI to reflect that the app has successfully received stocks data
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
          last_portfolio: null,
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
        delete position.aux_price
        delete position.aux_var
        delete position.aux_varpct
        delete position.var
        delete position.varpct

        if (!position.closed) {
          delete position.result
          delete position.resultpct
          delete position.current_price
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
    state.portfolioData.last_portfolio = nanoid()
    
    state.portfolioData.portfolios.push({
      id: state.portfolioData.last_portfolio,
      name: portfolioName,
      created_at: Date.now(),
      positions: []
    })
  },

  // Edits the name of an existing portfolio
  editPortfolio(state, payload) {
    let currPortfolio = findPortfolio(state, payload.id)
    currPortfolio.name = payload.name
  },

  // Deletes an existing portfolio from the portfolios data and updates the last portfolio
  // indicator
  deletePortfolio(state, portfolioId) {
    state.portfolioData.portfolios = state.portfolioData.portfolios.filter(portfolio => portfolio.id !== portfolioId)
    
    if (state.portfolioData.portfolios.length > 0) {
      state.portfolioData.last_portfolio = state.portfolioData.portfolios[0].id
    } else {
      state.portfolioData.last_portfolio = null
    }
  },

  // Creates a new position and pushes it to the current portfolio positions
  addPosition(state, positionData) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)
    lastPortfolio.positions.push({
      id: nanoid(),
      stock: positionData.stock,
      initial_price: positionData.initial_price,
      amount: positionData.amount,
      asset: positionData.asset,
      type: positionData.type,
      created_at: Date.now(),
      closed: false
    })
  },

  // Closes (partially or completelly) an existing position in the current portfolio
  closePosition(state, closeObj) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)

    // Checks if a new position must be created and closed (partial closing), or just close
    // the existing one
    if (closeObj.new_amount === closeObj.old_position.amount) {
      lastPortfolio.positions.forEach(position => {
        if (position.id === closeObj.old_position.id) {
          position.closed = true
          position.close_price = closeObj.close_price
          position.closed_at = Date.now()
          return
        }
      })
    } else {
      let diff = closeObj.old_position.amount - closeObj.new_amount

      // Updates the remaining amount
      lastPortfolio.positions.forEach(position => {
        if (position.id === closeObj.old_position.id) {
          position.amount = diff
          return
        }
      })

      // Adds a new position to partially close
      lastPortfolio.positions.push({
        id: nanoid(),
        stock: closeObj.old_position.stock,
        initial_price: closeObj.old_position.initial_price,
        amount: closeObj.new_amount,
        type: closeObj.old_position.type,
        closed: true,
        created_at: closeObj.old_position.created_at,
        closed_at: Date.now(),
        close_price: closeObj.close_price,
        current_price: closeObj.close_price
      })
    }
  },

  // Deletes an existing position from the current portfolio
  deletePosition(state, positions) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)
    lastPortfolio.positions = lastPortfolio.positions.filter(position => !positions.includes(position))
  },

  // Moves an existing position from the current portfolio by pushing it to a new portfolio, and
  // then deleting it from the current one
  movePosition(state, moveObj) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)
    let newPortfolio = findPortfolio(state, moveObj.portfolio)
    newPortfolio.positions.push(moveObj.position)
    lastPortfolio.positions = lastPortfolio.positions.filter(position => ![moveObj.position].includes(position))
  },

  // Sets a dictionary of the latest stock prices in the state
  setStocksData(state, stocksData) {
    stocksData.forEach(s => {
      state.stocksData[s.quoteSummary.result[0].price.symbol] = {
        price: s.quoteSummary.result[0].price.regularMarketPrice.raw,
        var: s.quoteSummary.result[0].price.regularMarketChange.raw,
        varpct: s.quoteSummary.result[0].price.regularMarketChangePercent.raw
      }
    })
  },

  // Sets the latest stock prices for each position of all portfolios 
  setStockPrices(state) {
    state.portfolioData.portfolios.forEach(portfolio => {
      let sum = 0
      portfolio.positions.forEach(p => {
        if (p.stock in state.stocksData) {
          p.var = state.stocksData[p.stock].var
          p.varpct = state.stocksData[p.stock].varpct
          p.current_price = p.closed ? p.close_price : state.stocksData[p.stock].price
          
          // Compute the position result
          let diff = p.current_price - p.initial_price
          p.result = (p.type === 'long') ? diff * p.amount : -diff * p.amount
          p.resultpct = p.result / (p.initial_price * p.amount)
          sum += parseFloat(p.result)
        }
      })

      // Sets the final result only for the current portfolio
      if (portfolio.id === state.portfolioData.last_portfolio)
        state.finalResult = parseFloat(sum)
    })
  },

  // Sets a dictionary of the dividends history of stocks in the state
  setDividendData(state, dividendsData) {
    dividendsData.forEach(d => {
      let parser = new DOMParser()
      let doc = parser.parseFromString(d.data, 'text/html')
      let results = JSON.parse(doc.getElementById('results').value)
      
      let dividends = []
      results.forEach(r => dividends.push({
        ed: utils.toTimestamp(r.ed),
        pd: utils.toTimestamp(r.pd),
        value: r.v,
        type: r.etd
      }))
      
      state.dividendsData[d.stock] = dividends
    })
  },

  // Sets the latest dividends received for each position of all portfolios. A dividend is
  // received if a position's time interval contains the ex-dividends date
  setReceivedDividends(state) {
    state.finalDividends = 0
    state.portfolioData.portfolios.forEach(portfolio => {
      portfolio.dividendsReceived = []
      portfolio.positions.forEach(p => {
        if (p.stock in state.dividendsData) {
          let dividendData = state.dividendsData[p.stock]
          p.dividends = 0
          
          // Finds all the dividends received for the current position
          dividendData.forEach(d => {
            let finalDate = p.closed ? p.closed_at : Date.now()
            let key = d.ed.toString().concat(d.pd.toString(), p.stock, d.type.split(' ')[0])
            if (utils.isInInterval(d.ed, p.created_at, finalDate)) {
              p.dividends += p.amount * d.value
              portfolio.dividendsReceived.push({
                stock: p.stock,
                amount: p.amount,
                result: p.amount * d.value,
                key: key,
                ...d
              })
            }
          })
        }

        if (portfolio.id === state.portfolioData.last_portfolio)
          state.finalDividends += p.dividends
      })
      
      // Looks for repeated dividends (more than one position eligible for a dividend)
      let finalDividends = []
      let groupedDividends = groupBy(portfolio.dividendsReceived, 'key')
      
      for (const value of Object.entries(groupedDividends)) {
        let [amount, result, dividend] = [0, 0, null]
        value[1].forEach(v => { amount += parseInt(v.amount); result += v.result })
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

// Groups an array of objects by a given key
function groupBy(xs, key) {
  return xs.reduce(function(rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
}

// Finds a portfolio of a given ID on the list of portfolios stored in the state
function findPortfolio(state, id) {
  return state.portfolioData.portfolios.find(portfolio => {
    return portfolio.id == id
  })
}

export default {
  state,
  getters,
  actions,
  mutations
}
