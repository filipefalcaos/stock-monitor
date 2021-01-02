import { eachMonthOfInterval, format, getTime, isWithinInterval, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Formats a given timestamp (in milliseconds) to a format specified by each available 
// formatting mode. Available modes: 'default', 'month-year'
function formatDate(timestamp, mode = 'default') {
  let date = new Date(timestamp)
  switch (mode) {
    case 'month-year':
      return format(date, 'MMM/yyyy', {locale: ptBR})
    case 'default':
      return format(date, 'dd/MM/yyyy HH:mm')
    default:
      return format(date, 'dd/MM/yyyy HH:mm')
  }
}

// Converts a given date in the format 'dd/MM/yyyy' to a timestamp (in milliseconds)
function toTimestamp(date) {
  let toConvert = parse(date, 'dd/MM/yyyy', new Date())
  return getTime(toConvert)
}

// Retrieves the months in the interval of two given date strings in the format 
// 'MMM/yyyy'. The start and end months are not included
function monthsInInterval(date1, date2) {
  let initialDate = parse(date1, 'MMM/yyyy', new Date(), {locale: ptBR})
  let finalDate = parse(date2, 'MMM/yyyy', new Date(), {locale: ptBR})
  let months = eachMonthOfInterval({ start: initialDate, end: finalDate })
  let formatted = Object.values(months.map(m => format(m, 'MMM/yyyy', {locale: ptBR})))
  formatted.shift()
  formatted.pop()
  return formatted
}

// Checks if a given timestamp is in the interval of two other given timestamps 
// (all in milliseconds)
function isInInterval(date, date1, date2) {
  let toTest = new Date(date)
  let initialDate = new Date(date1)
  let finalDate = new Date(date2)
  return isWithinInterval(toTest, { start: initialDate, end: finalDate })
}

export const dateUtils = {
  formatDate: formatDate,
  toTimestamp: toTimestamp,
  monthsInInterval: monthsInInterval,
  isInInterval: isInInterval
}
