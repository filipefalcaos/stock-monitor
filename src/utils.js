import { eachMonthOfInterval, format, getTime, isWithinInterval, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Formats a given number to a currency
function formatCurrency(num, precision = 2) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(num)
}

// Formats a given number to percentage
function formatPercent(num) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Formats a given timestamp (in milliseconds) to the format 'dd/MM/yyyy HH:mm'
function defaulFormat(timestamp) {
  let date = new Date(timestamp)
  return format(date, 'dd/MM/yyyy HH:mm')
}

// Formats a given timestamp (in milliseconds) to the format 'MMM/yyyy'
function monthYearFormat(timestamp) {
  let date = new Date(timestamp)
  return format(date, 'MMM/yyyy', {locale: ptBR})
}

// Formats a given timestamp (in milliseconds) to a format specified by each available 
// formatting mode. Available modes: 'default', 'month-year'
function formatDate(timestamp, mode = 'default') {
  switch (mode) {
    case 'month-year':
      return monthYearFormat(timestamp)
    case 'default':
      return defaulFormat(timestamp)
    default:
      return defaulFormat(timestamp)
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

export const utils = {
  formatCurrency: formatCurrency,
  formatPercent: formatPercent,
  formatDate: formatDate,
  toTimestamp: toTimestamp,
  monthsInInterval: monthsInInterval,
  isInInterval: isInInterval
}
