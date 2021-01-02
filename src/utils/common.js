import crypto from 'crypto'

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

// Suffles the items on a given array by using the Durstenfeld shuffle
// Reference: https://stackoverflow.com/a/12646864
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

// Hashes a string by using the Node's crypto implementation of the SHA-256 algorithm
// Reference: https://nodejs.org/api/crypto.html#crypto_class_hash
function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}

export const utils = {
  formatCurrency: formatCurrency,
  formatPercent: formatPercent,
  shuffleArray: shuffleArray,
  hashString: hashString
}
