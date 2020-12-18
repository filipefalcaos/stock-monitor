import { utils } from '../../utils'

// Initial state
const state = () => ({
  cumulativeSum: [],      // The cumulative sum of the results (all portfolios)
  chartLabels: [],        // The chart labels for cumulative sums
  operationsCount: 0,     // The count of operations performed (all portfolios)
  overallResults: {},     // The cumulative result of all portfolios
  operationsPerStock: {}, // The number of operations per stock (all portfolios)
  investmentPerStock: {}  // The amount of money invested per stock (all portfolios)
})

// Getters
const getters = {}

// Actions
const actions = {
  computeStats({ commit }, portfolioData) {
    commit('computeCumSum', portfolioData)
    commit('getDistData', portfolioData)
    commit('getOperationsCount', portfolioData)
    commit('getOverallResults', portfolioData)
  }
}

// Mutations
const mutations = {
  computeCumSum(state, portfolioData) {
    let allLabels = new Set()
    state.cumulativeSum = []

    portfolioData.portfolios.forEach(portfolio => {
      let currentPositions = portfolio.positions
      currentPositions.forEach(p => p.closed ? null : p.closed_at = Date.now())
      currentPositions.sort((a, b) => a.closed_at - b.closed_at)

      // Computes the monthly cumulative sum
      let results = currentPositions.map(a => a.result).map(cumulativeSum(0))
      let dates = currentPositions.map(a => a.closed_at).map((x) => utils.formatDate(x, 'month-year'))
      let data = results.map((x, i) => [x, dates[i]])
      
      // Groups results by date
      const groupedResults = data.reduce((groups, result) => {
        const date = result[1].split(' ')[0]
        if (!groups[date]) groups[date] = []
        groups[date].push(result)
        return groups
      }, {})

      const groupArrays = Object.keys(groupedResults).map((date) => {
        return {
          date,
          results: groupedResults[date]
        }
      })

      let finalResults = [], finalDates = []
      groupArrays.forEach(x => {
        finalResults.push(x.results[x.results.length - 1][0])
        finalDates.push(x.date)
      })

      // Fills the time gaps
      let finalResultsAux = [], finalDatesAux = []
      finalDates.forEach((date, index) => {
        finalResultsAux.push(finalResults[index])
        
        if (index !== (finalDates.length - 1)) {
          finalDatesAux.push(finalDates[index])
          let newDates = utils.monthsInInterval(date, finalDates[index + 1]) // Looks for time gaps
          
          if (newDates.length > 0) {
            newDates.forEach(newDate => {
              finalResultsAux.push(finalResults[index])
              finalDatesAux.push(newDate)
            })
          }
        } else {
          finalDatesAux.push(finalDates[finalDates.length - 1])
        }
      })

      // Set the cumulative sum of the portfolio
      finalDatesAux.forEach(dt => allLabels.add(dt))
      state.cumulativeSum.push({
        results: finalResultsAux,
        dates: finalDatesAux,
        title: portfolio.name
      })
      
      currentPositions.forEach(p => {
        if (!p.closed) delete p.closed_at
      })
    })

    // Fills the data gaps in datasets
    // A dataset that does not have all the labels of "state.chartLabels" will be 
    // filled with null
    state.cumulativeSum.forEach(cs => {
      let currRes = [], count = 0
      allLabels.forEach(l => {
        if (cs.dates.includes(l)) {
          currRes.push(cs.results[count])
          count++
        } else {
          currRes.push(null)
        }
      })
      
      cs.results = currRes
    })

    state.chartLabels = [...allLabels]
  },

  getOperationsCount(state, portfolioData) {
    let ops = portfolioData.portfolios.map(p => p.positions.length).reduce((a, b) => a + b, 0)
    state.operationsCount = ops
  },

  getOverallResults(state, portfolioData) {
    let resStocks = 0
    let resDividends = 0
    
    portfolioData.portfolios.forEach(portfolio => {
      portfolio.positions.forEach(position => {
        resStocks += position.result
        resDividends += position.dividends
      })
    })

    state.overallResults.stocks = resStocks.toFixed(2)
    state.overallResults.dividends = resDividends.toFixed(2)
  },

  getDistData(state, portfolioData) {
    let count = {}, values = {}
    
    portfolioData.portfolios.forEach(portfolio => {
      portfolio.positions.forEach(position => {
        count[position.stock] = count[position.stock] + 1 || 1
        if (!position.closed) {
          let value = position.amount * position.initial_price
          values[position.stock] = values[position.stock] + value || value
        }
      })
    })

    state.operationsPerStock = count
    state.investmentPerStock = values
  }
}

// Computes the cumulative sum of a numerical array
const cumulativeSum = (sum => value => sum += value)

export default {
  state,
  getters,
  actions,
  mutations
}
