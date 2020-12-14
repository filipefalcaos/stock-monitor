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
    data: {
      type: Array,
      default: () => []
    },
    labels: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      chart: null,
      chartId: ''
    }
  },

  watch: {
    data: function(newData, oldData) {
      oldData /* Unused */
      this.chart.data.labels = this.labels
      this.chart.data.datasets[0].data = newData
      this.chart.update()
    }
  },

  created() {
    this.chartId = nanoid()
  },

  mounted() {
    let ctx = document.getElementById(this.chartId).getContext('2d')
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.title,
          borderColor: '#20A8D8',
          backgroundColor: '#20A8D8',
          cubicInterpolationMode: 'monotone',
          data: this.data,
          fill: false
        }]
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
            label: function (tooltipItems, data) {
              data /* Unused */
              return utils.formatCurrency(tooltipItems.yLabel)
            }
          }
        }
      }
    });
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 600px
}
</style>
