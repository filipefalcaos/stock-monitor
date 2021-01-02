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
  name: 'CumsumChart',
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

  watch: {
    // Watches for changes on the datasets
    // When changes are detected, the new datasets are parsed and then set in the existing chart
    // to be updated
    datasets: function(val) {
      this.parseDatasets(val)
      this.chart.data.labels = this.labels
      this.chart.data.datasets = this.parsedDatasets
      this.chart.update()
    }
  },

  // Sets up an unique chart id and parses the datasets when the chart component is created
  created() {
    this.chartId = nanoid()
    this.parseDatasets(this.datasets)
  },

  // Creates the chart when the canvas element is already loaded
  mounted() {
    this.createChart()
  },

  methods: {
    // Parses the timeseries datasets to the format expect by ChartJS
    parseDatasets(datasets) {
      this.parsedDatasets = []
      datasets.forEach(d => {
        this.parsedDatasets.push({
          label: d.title,
          cubicInterpolationMode: 'monotone',
          data: d.results,
          fill: false
        })
      })
    },

    // Creates the ChartJS line chart for timeseries plotting with the specified options and
    // parsed data
    createChart() {
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
          legend: {
            labels: {
              boxWidth: 20
            }
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            displayColors: false,
            callbacks: {
              label: function(tooltipItem, data) {
                data /* Unused */
                return utils.formatCurrency(tooltipItem.yLabel)
              }
            }
          },
          animation: {
            duration: 0
          },
          plugins: {
            colorschemes: {
              scheme: Classic20
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
  height: 600px
}
</style>
