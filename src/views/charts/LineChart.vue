<template>
  <CChartLine
    :datasets="defaultDatasets"
    :options="defaultOptions"
    :labels="labels"
  />
</template>

<script>
import { CChartLine } from '@coreui/vue-chartjs'

export default {
  name: 'LineChart',
  components: { CChartLine },
  
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
      defaultDatasets: [
        {
          label: '',
          fill: false,
          borderColor: '#20A8D8',
          backgroundColor: '#20A8D8',
          borderWidth: 2,
          data: [39, 80, -40, 35, 40, 20, 45]
        }
      ]
    }
  },

  computed: {
    defaultOptions() {
      return {
        maintainAspectRatio: false,
        elements: {
          point: {
            radius: 2,
            hitRadius: 10,
            hoverRadius: 2,
            hoverBorderWidth: 3
          }
        },
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                index, values /* Unused */
                return 'R$ ' + value
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
              return ' R$ ' + tooltipItems.yLabel
            }
          }
        },
      }
    }
  },

  created() {
    this.defaultDatasets[0].data = this.data;
    this.defaultDatasets[0].label = this.title;
  }
}
</script>
