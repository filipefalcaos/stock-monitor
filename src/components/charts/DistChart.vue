<template>
  <div class="chart-container">
    <canvas :id="chartId" />
  </div>
</template>

<script>
import Chart from 'chart.js'
import { nanoid } from 'nanoid'
import { utils } from '../../utils/common'

import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes'
import { Classic20 } from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau'

export default {
  name: 'DistChart',
  props: {
    dist: {
      type: Object,
      default: () => {}
    },
    maxEntries: {
      type: Number,
      default: 15
    },
    isCurrency: {
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
    // Watches for changes on the distribution data
    // When changes are detected, the new data is parsed and then set in the existing chart to be
    // updated
    dist: function(val) {
      this.parseData(val)
      this.chart.data.labels = this.labels
      this.chart.data.datasets[0].data = this.data
      this.chart.update()
    }
  },

  // Sets up an unique chart id and parses the distribution data when the chart component is
  // created
  created() {
    this.chartId = nanoid()
    this.parseData(this.dist)
  },

  // Creates the chart when the canvas element is already loaded
  mounted() {
    this.createChart()
  },

  methods: {
    // Parses the distribution data to the format expect by ChartJS
    // Only "maxEntries" entries are parsed to the final dataset. The remaining ones are grouped
    // together into a "remaining" entry
    parseData(dist) {
      let sortedDist = Object.entries(dist).sort(([, a],[, b]) => a - b)
      let selected = sortedDist.slice(-this.maxEntries)
      let remaining = sortedDist.slice(0, sortedDist.length - this.maxEntries)

      this.data = []
      this.labels = []
      selected.forEach(s => {
        this.data.push(s[1])
        this.labels.push(s[0].replace('.SA', ''))
      })

      let sum = 0
      remaining.forEach(r => sum += r[1])
      if (remaining.length > 0) {
        this.data.push(sum)
        this.labels.push('Outros')
      }
    },

    // Creates the ChartJS doughnut chart for distribution plotting with the specified options and
    // parsed data
    createChart() {
      let isCurrency = this.isCurrency
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
            position: 'left',
            labels: {
              boxWidth: 20,
              padding: 5
            }
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
                return isCurrency ? label + utils.formatCurrency(val).toString() : label + val.toString()
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
