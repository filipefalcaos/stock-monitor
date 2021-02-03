import { dateUtils } from '../../utils/date'

const state = () => ({
  cumulativeSum: [],         // The cumulative sum of the results on the current dashboard view
  cumulativeSumLabels: [],   // The chart labels for cumulative sum
  operationsCount: 0,        // The count of operations performed (all portfolios)
  overallResults: {},        // The cumulative result of all portfolios
  operationsPerAsset: {},    // The number of operations per asset (all portfolios)
  investmentPerAsset: {},    // The amount of money invested per asset (all portfolios)
  investmentPerAssetType: {} // The amount of money invested per type of asset (all portfolios)
})

const getters = {}

const actions = {
  // Computes all the statistics regarding the portfolios and options operations on the current 
  // dashboard view
  computeStats({ commit }, payload) {
    commit('computeCumSum', payload.positions)
    commit('getDistData', payload.portfolioData)
    commit('getOperationsCount', payload.portfolioData)
    commit('getOverallResults', payload.portfolioData)
  }
}

const mutations = {
  // Computes the cumulative sum of the positions results on the current dashboard view. If 
  // there are time gaps in the timeseries, they are automatically filled. The open positions 
  // are considered closed in the current date just for plotting purposes
  computeCumSum(state, positions) {
    positions.forEach(p => p.closed ? null : p.closedAt = Date.now())
    positions.sort((a, b) => a.closedAt - b.closedAt)

    // Computes the monthly cumulative sum
    let results = positions.map(a => a.result).map(cumulativeSum(0))
    let dates = positions.map(a => a.closedAt).map((x) => dateUtils.formatDate(x, 'month-year'))
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
        let newDates = dateUtils.monthsInInterval(date, finalDates[index + 1]) // Looks for time gaps
        
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

    // Remove the 'closed_at' property from the open positions
    positions.forEach(p => {
      if (!p.closed) delete p.closed_at
    })

    state.cumulativeSum = finalResultsAux
    state.cumulativeSumLabels = finalDatesAux
  },

  // Gets the amount of positions opened in all portfolios
  getOperationsCount(state, portfolioData) {
    let ops = portfolioData.portfolios.map(p => p.positions.length).reduce((a, b) => a + b, 0)
    state.operationsCount = ops
  },

  // Gets the sum of the ressults of all portfolios
  getOverallResults(state, portfolioData) {
    let resAssets = 0
    let resDividends = 0
    
    portfolioData.portfolios.forEach(portfolio => {
      portfolio.positions.forEach(position => {
        resAssets += position.result
        resDividends += position.dividends
      })
    })

    state.overallResults.assets = resAssets.toFixed(2)
    state.overallResults.dividends = resDividends.toFixed(2)
  },

  // Gets the following distribution data in all portfolios: (i) positions opened by asset;
  // (ii) value of opened positions by asset; and (iii) value of opened positions by the type of
  // the assets
  getDistData(state, portfolioData) {
    let assetCount = {}, assetValues = {}
    let typeValues = {}
    
    portfolioData.portfolios.forEach(portfolio => {
      portfolio.positions.forEach(position => {
        assetCount[position.asset] = assetCount[position.asset] + 1 || 1
        if (!position.closed) {
          let value = position.amount * position.initialPrice
          assetValues[position.asset] = assetValues[position.asset] + value || value
          
          if (position.assetType === 'fii') {
            typeValues['FIIs'] = typeValues['FIIs'] + value || value
          } else {
            typeValues['Ações'] = typeValues['Ações'] + value || value
          }
        }
      })
    })

    state.operationsPerAsset = assetCount
    state.investmentPerAsset = assetValues
    state.investmentPerAssetType = typeValues
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
