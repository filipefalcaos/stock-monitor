import { remote } from 'electron'
import { nanoid } from 'nanoid'
import { NotificationProgrammatic } from 'buefy'
import { utils } from '../../utils'
import axios from 'axios'

import path from 'path'
const fs = require('fs')

// Initial state
const state = () => ({
  dataFileName: '',     // The data filename
  finalResult: 0,       // Sum of results (+ dividends received) on the selected portfolio
  finalDividends: 0,    // Sum of dividends received on the selected portfolio
  portfolioData: {},    // Data loaded from the data file
  dividendsData: {},    // Latest history of dividends (all portfolios)
  stocksData: {},       // Latest prices of stocks (all portfolios)
  currentPositions: [], // Current positions on the selected portfolio
})

// Getters
const getters = {
  lastPortfolio: (state) => {
    return findPortfolio(state, state.portfolioData.last_portfolio)
  },

  stocksList: (state) => {
    return [...new Set(state.portfolioData.portfolios.map(port => port.positions.map(p => {
      return JSON.stringify({ stock: p.stock, asset: p.asset })
    })).flat())]
  },

  activeStocksList: (state) => {
    return [...new Set(state.currentPositions.map(p => {
      return JSON.stringify({ stock: p.stock, asset: p.asset })
    }))]
  },

  activeInvestment: (state, getters) => {
    state /* Unused */
    return getters.openPositions.reduce((total, position) => {
      return total + position.initial_price * position.amount
    }, 0)
  },

  openPositions: (state) => {
    return state.currentPositions.filter(position => !position.closed)
  },

  closedPositions: (state) => {
    return state.currentPositions.filter(position => position.closed)
  },

  lastPositions: (state) => {
    state.currentPositions.sort((a, b) => a.created_at - b.created_at)
    return state.currentPositions.slice(-5).reverse()
  },

  lastDividends: (state) => {
    state.receivedDividends.sort((a, b) => utils.toTimestamp(a.pd) - utils.toTimestamp(b.pd))
    return state.receivedDividends.slice(-5).reverse()
  },

  isEmpty: (state) => {
    return state.portfolioData.portfolios.length === 0
  }
}

// Actions
const actions = {
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

  updateUI({ commit }) {
    commit('set', ['isLoading', false])
    commit('set', ['hasNewData', true])
    setTimeout(() => { commit('set', ['hasNewData', false]) }, 2000)
  }
}

// Mutations
const mutations = {
  setDataFileName(state) {
    const dataPath = '/portfolio-data.json'
    state.dataFileName = path.join(remote.app.getPath('userData'), dataPath)
  },

  loadDataFile(state) {
    state
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

  newPortfolio(state, portfolioName) {
    state.portfolioData.last_portfolio = nanoid()
    state.portfolioData.portfolios.push({
      id: state.portfolioData.last_portfolio,
      name: portfolioName,
      created_at: Date.now(),
      positions: []
    })
  },

  editPortfolio(state, payload) {
    let currPortfolio = findPortfolio(state, payload.id)
    currPortfolio.name = payload.name
  },

  deletePortfolio(state, portfolioId) {
    state.portfolioData.portfolios = state.portfolioData.portfolios.filter(portfolio => portfolio.id !== portfolioId)
    
    if (state.portfolioData.portfolios.length > 0) {
      state.portfolioData.last_portfolio = state.portfolioData.portfolios[0].id
    } else {
      state.portfolioData.last_portfolio = null
    }
  },

  setCurrentPositions(state, positions) {
    state.currentPositions = positions
  },

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

  closePosition(state, closeObj) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)

    // Checks if a new position must be created and closed (partial closing), or just close
    // the existing one
    if (closeObj.new_amount === closeObj.old_position.amount) {
      state.currentPositions.forEach(position => {
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
      state.currentPositions.forEach(position => {
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

  deletePosition(state, positions) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)
    lastPortfolio.positions = state.currentPositions.filter(position => !positions.includes(position))
  },

  movePosition(state, moveObj) {
    let lastPortfolio = findPortfolio(state, state.portfolioData.last_portfolio)
    let newPortfolio = findPortfolio(state, moveObj.portfolio)
    newPortfolio.positions.push(moveObj.position)
    lastPortfolio.positions = state.currentPositions.filter(position => ![moveObj.position].includes(position))
  },

  setStocksData(state, stocksData) {
    stocksData.forEach(s => {
      state.stocksData[s.quoteSummary.result[0].price.symbol] = {
        price: s.quoteSummary.result[0].price.regularMarketPrice.raw,
        var: s.quoteSummary.result[0].price.regularMarketChange.raw,
        varpct: s.quoteSummary.result[0].price.regularMarketChangePercent.raw
      }
    })
  },

  setStockPrices(state) {
    state.portfolioData.portfolios.forEach(portfolio => {
      let sum = 0
      portfolio.positions.forEach(p => {
        p.var = state.stocksData[p.stock].var
        p.varpct = state.stocksData[p.stock].varpct
        p.current_price = p.closed ? p.close_price : state.stocksData[p.stock].price
        
        // Compute the position result
        let diff = p.current_price - p.initial_price
        p.result = (p.type === 'long') ? diff * p.amount : -diff * p.amount
        p.resultpct = p.result / (p.initial_price * p.amount)
        sum += parseFloat(p.result)
      })

      // Sets the final result only for the current portfolio
      if (portfolio.id === state.portfolioData.last_portfolio)
        state.finalResult = parseFloat(sum)
    })
  },

  setDividendData(state, dividendsData) {
    dividendsData.forEach(d => {
      let parser = new DOMParser()
      let doc = parser.parseFromString(d.data, 'text/html')
      let results = JSON.parse(doc.getElementById('results').value)
      
      let dividends = []
      results.forEach(r => dividends.push({ ed: r.ed, pd: r.pd, value: r.v, type: r.etd }))
      state.dividendsData[d.stock] = dividends
    })
  },

  setReceivedDividends(state) {
    state.finalDividends = 0
    state.portfolioData.portfolios.forEach(portfolio => {
      portfolio.dividendsReceived = []
      portfolio.positions.forEach(p => {
        let dividendData = state.dividendsData[p.stock]
        p.dividends = 0
        
        // Updates the profit of the positions with the dividends
        dividendData.forEach(d => {
          let finalDate = p.closed ? p.closed_at : Date.now()
          if (utils.isInInterval(d.ed, p.created_at, finalDate)) {
            p.dividends += p.amount * d.value
            portfolio.dividendsReceived.push({
              stock: p.stock,
              amount: p.amount,
              result: p.amount * d.value,
              key: d.ed.concat(d.pd, p.stock, d.type.split(' ')[0]), // This combination represents a single dividend
              ...d
            })
          }
        })

        p.result += p.dividends
        p.resultpct = p.result / (p.initial_price * p.amount)

        if (portfolio.id === state.portfolioData.last_portfolio)
          state.finalDividends += p.dividends
      })

      // Sets the final result only for the current portfolio
      if (portfolio.id === state.portfolioData.last_portfolio)
        state.finalResult += state.finalDividends
      
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

// Finds a portfolio of a given ID on the list of portfolios stored
// in the Vuex state
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
