<template>
  <div class="chart-container">
    <canvas :id="chartId" />
  </div>
</template>

<script>
import Chart from 'chart.js'
import { nanoid } from 'nanoid'
import { utils } from '../utils'

export default {
  name: 'LineChart',
  props: {
    datasets: {
      type: Array,
      default: () => []
    },
    labels: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      chart: null,
      chartId: '',
      parsedDatasets: []
    }
  },

  created() {
    this.chartId = nanoid()
    this.parseDatasets()
  },

  mounted() {
    let ctx = document.getElementById(this.chartId).getContext('2d')
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: this.parsedDatasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 2,
            hitRadius: 10,
            hoverRadius: 2,
            hoverBorderWidth: 3
          },
          line: {
            borderWidth: 2
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                index, values /* Unused */
                return utils.formatCurrency(value)
              }
            },
            gridLines: {
              display: true
            }
          }]
        },
        tooltips: {
          enabled: true,
          mode: 'single',
          callbacks: {
            label: function (tooltipItem, data) {
              data /* Unused */
              return utils.formatCurrency(tooltipItem.yLabel)
            }
          }
        }
      }
    })
  },

  methods: {
    parseDatasets() {
      this.parsedDatasets = []
      this.datasets.forEach(d => {
        this.parsedDatasets.push({
          label: d.title,
          borderColor: '#20A8D8',
          backgroundColor: '#20A8D8',
          cubicInterpolationMode: 'monotone',
          data: d.results,
          fill: false
        })
      })
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 600px
}
</style>
