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

    // Remove the 'closed_at' property from the open positions
    currentPositions.forEach(p => {
      if (!p.closed) delete p.closed_at
    })
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
