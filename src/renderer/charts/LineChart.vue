<!-- Single File Component -->
<script>
  import { Line } from 'vue-chartjs'

  export default {
    extends: Line,
    props: ["data", "labels", "title"],

    created() {
      this.chartData.labels = this.labels;
      this.chartData.datasets[0].data = this.data;
      this.chartData.datasets[0].label = this.title;
    },

    data() {
      return {
        chartData: {
          labels: [],
          datasets: [
            {
              label: "",
              data: [],
              fill: false,
              borderColor: '#2984D3',
              backgroundColor: '#2984D3',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }],
            xAxes: [ {
              gridLines: {
                display: false
              }
            }]
          },
          legend: {
            display: true
          },
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function (tooltipItems, data) { 
                return ' R$ ' + tooltipItems.yLabel;
              }
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                callback: function (value, index, values) {
                  return 'R$ ' + value;
                }
              }
            }]
          },
          responsive: true,
          maintainAspectRatio: false
        }
      }
    },
    
    mounted() {
      this.renderChart(this.chartData, this.options);
    }
  }
</script>
