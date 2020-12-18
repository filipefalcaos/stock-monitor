<template>
  <div class="chart-container">
    <canvas :id="chartId" />
  </div>
</template>

<script>
import Chart from 'chart.js'
import { nanoid } from 'nanoid'
import { utils } from '../utils'

import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes'
import { Classic20 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau'

export default {
  name: 'FrequencyChart',
  props: {
    frequencies: {
      type: Object,
      default: () => {}
    },
    dataIsMoney: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      chart: null,
      chartId: '',
      data: [],
      labels: []
    }
  },

  watch: {
    frequencies: function(val) {
      this.parseData(val)
      this.chart.data.labels = this.labels
      this.chart.data.datasets[0].data = this.data
      this.chart.update()
    }
  },

  created() {
    this.chartId = nanoid()
    this.parseData(this.frequencies)
  },

  mounted() {
    this.createChart()
  },

  methods: {
    parseData(frequencies) {
      this.data = []
      this.labels = []
      for (let [key, value] of Object.entries(frequencies)) {
        this.data.push(value)
        this.labels.push(key)
      }
    },

    createChart() {
      let dataIsMoney = this.dataIsMoney
      let ctx = document.getElementById(this.chartId).getContext('2d')
      
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.labels,
          datasets: [{ data: this.data }]
        },
        options: {
          responsive: true,
          legend: {
            position: 'left'
          },
          animation: {
            duration: 0
          },
          plugins: {
            colorschemes: {
              scheme: Classic20
            }
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            displayColors: false,
            callbacks: {
              label: function(tooltipItem, data) {
                let val = data.datasets[0].data[tooltipItem.index]
                let label = data.labels[tooltipItem.index] + ': '
                return dataIsMoney ? label + utils.formatCurrency(val).toString() : label + val.toString()
              }
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
}
</style>
