<template>
  <div>
    <CRow>
      <CCol lg="3">
        <CWidgetSimple
          class="no-pb"
          header="Operações Realizadas"
          :text="operationsCount.toString()"
        />
      </CCol>
      <CCol lg="3">
        <CWidgetSimple
          class="no-pb"
          header="Resultados - Carteiras de Ações"
          :text="$utils.formatCurrency(displayText(overallResults.stocks))"
        />
      </CCol>
      <CCol lg="3">
        <CWidgetSimple
          class="no-pb"
          header="Resultados - Operações em Opções"
          :text="$utils.formatCurrency(0)"
        />
      </CCol>
      <CCol lg="3">
        <CWidgetSimple
          class="no-pb"
          header="Rendimentos de Dividendos"
          :text="$utils.formatCurrency(displayText(overallResults.dividends))"
        />  
      </CCol>
    </CRow>

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              P&L - Carteiras de ações
            </h4>
          </CCol>
        </CRow>
        
        <line-chart
          v-if="!isEmpty && cumulativeSum.length > 0"
          :datasets="cumulativeSum"
          :labels="chartLabels"
          style="height: 300px; margin-top: 20px;"
        />
        <h6
          v-else
          style="margin-top: 0.5rem;"
        >
          Sem informações disponíveis.
        </h6>
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import LineChart from '../components/LineChart'

export default {
  name: 'Dashboard',
  components: { LineChart },

  computed: {
    ...mapState({
      cumulativeSum: state => state.stats.cumulativeSum,
      operationsCount: state => state.stats.operationsCount,
      overallResults: state => state.stats.overallResults,
      chartLabels: state => state.stats.chartLabels,
      portfolioData: state => state.portfolios.portfolioData,
      currentPositions: state => state.portfolios.currentPositions,
      hasNewData: state => state.hasNewData,
      isLoading: state => state.isLoading
    }),
    
    ...mapGetters({
      isEmpty: 'isEmpty',
      lastPortfolio: 'lastPortfolio',
      lastPositions: 'lastPositions',
      lastDividends: 'lastDividends',
      stocksList: 'stocksList'
    })
  },

  // Computes the statistics on the portfolios/options data when the component
  // is created
  async created() {
    await this.$store.dispatch('getStocksData', this.stocksList)
    this.computeStats()
  },

  methods: {
    computeStats() {
      this.$store.commit('computeCumSum', this.portfolioData)
      this.$store.commit('getOperationsCount', this.portfolioData)
      this.$store.commit('getOverallResults', this.portfolioData)
    },

    displayText(num) {
      return (!num) ? 0 : num
    }
  }
}
</script>
