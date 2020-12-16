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
          v-if="!isEmpty"
          :data="cumulativeSum.currentResults"
          :labels="cumulativeSum.currentDates"
          :title="lastPortfolio.name"
          style="height: 300px; margin-top: 20px;"
        />
        <h6 v-else>
          Sem informações disponíveis.
        </h6>
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              Últimas operações
            </h4>
          </CCol>
        </CRow>

        <!-- Table of last opened positions -->
        <position-table
          class="mt-3"
          :position-data="lastPositions"
          :has-new-data="hasNewData"
          :has-actions="false"
        />
      </CCardBody>
    </CCard>

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              Últimos proventos
            </h4>
          </CCol>
        </CRow>

        <!-- Table of last dividends -->
        <!-- <dividend-table
          class="mt-3"
          :dividend-data="lastDividends"
          :has-new-data="hasNewData"
        /> -->
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import LineChart from '../components/LineChart'
//import DividendTable from '../components/DividendTable'
import PositionTable from '../components/PositionTable'

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    //DividendTable,
    PositionTable
  },

  computed: {
    ...mapState({
      cumulativeSum: state => state.stats.cumulativeSum,
      operationsCount: state => state.stats.operationsCount,
      overallResults: state => state.stats.overallResults,
      portfolioData: state => state.portfolios.portfolioData,
      currentPositions: state => state.portfolios.currentPositions,
      hasNewData: state => state.hasNewData
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
      this.$store.commit('computeCumSum', this.currentPositions)
      this.$store.commit('getOperationsCount', this.portfolioData)
      this.$store.commit('getOverallResults', this.portfolioData)
    },

    displayText(num) {
      return (!num) ? 0 : num
    }
  }
}
</script>
