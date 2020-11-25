import { add, isBefore, format, parse, sub } from 'date-fns'

// Formats a given number to a currency
function formatCurrency(num) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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

// Formats a given timestamp (in milliseconds) to the format 'dd-MM-yyyy HH:mm'
function defaulFormat(timestamp) {
  let date = new Date(timestamp)
  return format(date, 'dd-MM-yyyy HH:mm')
}

// Formats a given timestamp (in milliseconds) to the format 'MMM-yyyy'
function monthYearFormat(timestamp) {
  let date = new Date(timestamp)
  return format(date, 'MMM-yyyy')
}

// Formats a given timestamp (in milliseconds) to a format specified by each available 
// formatting mode
// Available modes: 'default', 'month-year'
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

// Retrieves the months between two given date strings in the format 'MMM-yyyy'
// The start and end months are not included
function monthsBetDates(date1, date2) {
  let initialDate = parse(date1, 'MMM-yyyy', new Date())
  let finalDate = parse(date2, 'MMM-yyyy', new Date())

  if (isBefore(finalDate, initialDate)) {
    return []
  }

  let months = []
  finalDate = sub(finalDate, {months: 1})
  while (isBefore(initialDate, finalDate)) {
    initialDate = add(initialDate, {months: 1})
    months.push(format(initialDate, 'MMM-yyyy'))
  }
  
  return months
}

export const utils = {
  formatCurrency: formatCurrency,
  formatPercent: formatPercent,
  formatDate: formatDate,
  monthsBetDates: monthsBetDates
}
