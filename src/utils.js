// Formats a given number to a currency
function format_currency(num) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Formats a given number to percentage
function format_percent(num) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Formats a given timestamp (in milliseconds) to the format 'DD-MM-YY HH:mm'
function format_date(timestamp) {
  let timestampDate = new Date(timestamp)
  let day = timestampDate.getDate().toString().padStart(2, '0')
  let month = (timestampDate.getMonth() + 1).toString().padStart(2, '0')
  let hour = timestampDate.getHours().toString().padStart(2, '0')
  let minute = timestampDate.getMinutes().toString().padStart(2, '0')

  let date = day + '-' + month + '-' + timestampDate.getFullYear()
  let time = hour + ':' + minute
  return date + ' ' + time
}

// Formats a given timestamp (in milliseconds) to the format 'MMMM-YY'
function format_date_month(timestamp) {
  let months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 
                'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  
  let timestampDate = new Date(timestamp)
  return months[timestampDate.getMonth()] + '-' + timestampDate.getFullYear()
}

module.exports = {
  format_currency: format_currency,
  format_percent: format_percent,
  format_date: format_date,
  format_date_month: format_date_month
}
