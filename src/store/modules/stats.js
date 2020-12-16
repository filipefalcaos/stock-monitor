import { utils } from '../../utils'

// Initial state
const state = () => ({
  cumulativeSum: {},            // The cumulative sum of the results (all portfolios)
  operationsCount: 0,           // The count of operations performed (all portfolios)
  overallResultPortfolios: 0.0, // The cumulative result of all portfolios
  overallDividends: 0.0,        // The cumulative dividends received on all portfolios
  overallResultOptions: 0.0,    // The cumulative result of options operations
})

// Getters
const getters = {}

// Actions
const actions = {}

// Mutations
const mutations = {
  computeCumSum(state, currentPositions) {
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

    state.cumulativeSum.currentResults = finalResultsAux
    state.cumulativeSum.currentDates = finalDatesAux

    // Remove the 'closed_at' property from the open positions
    currentPositions.forEach(p => {
      if (!p.closed) delete p.closed_at
    })
  },

  getOperationsCount(state, portfolioData) {
    let ops = portfolioData.portfolios.map(p => p.positions.length).reduce((a, b) => a + b, 0)
    state.operationsCount = ops
  },

  getOverallResultPortfolios(state, portfolioData) {
    let res = 0
    portfolioData.portfolios.forEach(portfolio => {
      portfolio.positions.forEach(position => {
        res += position.result
      })
    })

    state.overallResultPortfolios = res.toFixed(2)
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
