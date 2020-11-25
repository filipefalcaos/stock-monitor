import { utils } from '../../utils'

// Initial state
const state = () => ({
  cumulativeSum: {}
})

// Getters
const getters = {}

// Actions
const actions = {}

// Mutations
const mutations = {
  computeCumSum(state, payload) {
    let closed = payload.currentPositions.filter(position => position.closed)
    closed.sort((a, b) => a.closed_at - b.closed_at)

    // Computes the monthly cumulative sum
    let results = closed.map(a => parseInt(a.result)).map(cumulativeSum(0))
    let dates = closed.map(a => a.closed_at).map((x) => utils.formatDate(x, 'month-year'))
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

    // Makes the cumulative sum start with 0
    let startDate = payload.lastPortfolio.created_at
    startDate = utils.formatDate(startDate, 'month-year').split(' ')[0]
    finalResults.unshift(0)
    finalDates.unshift(startDate)

    // Fills the time gaps
    let finalResultsAux = [], finalDatesAux = []
    finalDates.forEach((date, index) => {
      finalResultsAux.push(finalResults[index])
      
      if (index !== (finalDates.length - 1)) {
        let newDates = utils.monthsBetDates(date, finalDates[index + 1]) // Looks for time gaps
        if (newDates.length > 0) {
          newDates.forEach(newDate => {
            finalResultsAux.push(finalResults[index])
            finalDatesAux.push(newDate)
          })
        }
      }

      finalDatesAux.push(finalDates[index])
    })

    state.cumulativeSum.currentResults = finalResultsAux
    state.cumulativeSum.currentDates = finalDatesAux
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}

// Computes the cumulative sum of a numerical array
const cumulativeSum = (sum => value => sum += value)
