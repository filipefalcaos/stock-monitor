import { remote } from 'electron'
import { nanoid } from 'nanoid'
import { Notification } from 'buefy'
import axios from 'axios'

import path from 'path'
const fs = require('fs')

// Initial state
const state = () => ({
  currentPositions: [],
  dataFileName: '',
  finalResult: 0,
  portfolioData: {}
})

// Getters
const getters = {
  lastPortfolio: (state) => {
    return state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio
    })
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
    return state.currentPositions.slice(1).slice(-10).reverse()
  },

  isEmpty: (state) => {
    return state.portfolioData.portfolios.length === 0
  }
}

// Actions
const actions = {
  getStockPrices({ commit, state }) {
    commit('set', ['isLoading', true])
    commit('set', ['hasError', false])
    
    // Gets the most recent price of each stock from Yahoo Finance
    const base_url = 'https://query2.finance.yahoo.com/v10/'
    const uniqueStocks = [...new Set(state.currentPositions.map(p => p.stock))]
    
    let promises = []
    uniqueStocks.forEach(s => {
      promises.push(
        axios
          .get(base_url + 'finance/quoteSummary/' + s + '?modules=price')
          .then(response => response.data)
      )
    })

    // Updates the prices
    Promise.all(promises)
      .then(responses => {
        commit('updatePrices', responses)
        commit('set', ['isLoading', false])
        commit('set', ['hasNewData', true])
        setTimeout(() => { commit('set', ['hasNewData', false]) }, 2000)
      })
      .catch(error => {
        error /* Unused */
        commit('set', ['hasError', true])
        if (state.isLoading) commit('set', ['isLoading', false])
        
        // Display an error message
        Notification.open({
          duration: 5000,
          message: 'Falha ao se conectar ao servidor. Por favor, cheque sua conexão.',
          position: 'is-bottom-right',
          type: 'is-danger'
        })
      })
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
    let currPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == payload.id
    })

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

  addPosition(state, postionData) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio
    })

    lastPortfolio.positions.push({
      id: nanoid(),
      stock: postionData.stock,
      initial_price: postionData.initial_price,
      amount: postionData.amount,
      type: postionData.type,
      created_at: Date.now(),
      closed: false
    })
  },

  closePosition(state, closeObj) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio
    })

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
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio
    })

    lastPortfolio.positions = state.currentPositions.filter(position => !positions.includes(position))
  },

  updatePrices(state, priceData) {
    let results = {}
    priceData.forEach(r => {
      results[r.quoteSummary.result[0].price.symbol] = {
        price: r.quoteSummary.result[0].price.regularMarketPrice.raw,
        var: r.quoteSummary.result[0].price.regularMarketChange.raw,
        varpct: r.quoteSummary.result[0].price.regularMarketChangePercent.raw
      }
    })

    // Updates the prices for each position
    let sum = 0
    state.currentPositions.forEach(p => {
      p.var = results[p.stock].var
      p.varpct = results[p.stock].varpct
      p.current_price = p.closed ? p.close_price : results[p.stock].price
      
      // Compute the position result
      let diff = p.current_price - p.initial_price
      p.result = (p.type === 'long') ? diff * p.amount : -diff * p.amount
      p.resultpct = p.result / (p.initial_price * p.amount)
      sum += parseFloat(p.result)
    })

    state.finalResult = parseFloat(sum)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
