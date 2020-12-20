<template>
  <div v-if="!appCreated && !isEmpty">
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
          header="Resultados - Carteiras de Ativos"
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
          header="Proventos Recebidos"
          :text="$utils.formatCurrency(displayText(overallResults.dividends))"
        />  
      </CCol>
    </CRow>

    <CCard>
      <CCardBody>
        <h4
          class="mb-0"
          style="text-align: center;"
        >
          P&L - Carteiras de ativos
        </h4>
        
        <cumsum-chart
          :datasets="cumulativeSum"
          :labels="chartLabels"
          style="height: 300px; margin-top: 20px;"
        />
      </CCardBody>
    </CCard>

    <CRow>
      <CCol lg="4">
        <CCard>
          <CCardBody>
            <h4
              class="mb-0"
              style="text-align: center;"
            >
              Ativos mais negociados
            </h4>
            
            <frequency-chart
              :frequencies="operationsPerStock"
              style="margin-top: 20px;"
            />
          </CCardBody>
        </CCard>
      </CCol>
      
      <CCol lg="4">
        <CCard>
          <CCardBody>
            <h4
              class="mb-0"
              style="text-align: center;"
            >
              Posições em aberto por ativo
            </h4>
            
            <frequency-chart
              :frequencies="investmentPerStock"
              :data-is-money="true"
              style="margin-top: 20px;"
            />
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg="4">
        <CCard>
          <CCardBody>
            <h4
              class="mb-0"
              style="text-align: center;"
            >
              Posições em aberto por tipo
            </h4>
            
            <frequency-chart
              :frequencies="investmentPerAsset"
              :data-is-money="true"
              style="margin-top: 20px;"
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>

  <!-- Displays the empty app message -->
  <empty-app v-else-if="isEmpty" />
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import EmptyApp from '../components/EmptyApp'
import CumsumChart from '../components/CumsumChart'
import FrequencyChart from '../components/FrequencyChart'

export default {
  name: 'Dashboard',
  components: {
    EmptyApp,
    CumsumChart,
    FrequencyChart
  },

  computed: {
    ...mapState({
      cumulativeSum: state => state.stats.cumulativeSum,
      operationsCount: state => state.stats.operationsCount,
      overallResults: state => state.stats.overallResults,
      chartLabels: state => state.stats.chartLabels,
      operationsPerStock: state => state.stats.operationsPerStock,
      investmentPerStock: state => state.stats.investmentPerStock,
      investmentPerAsset: state => state.stats.investmentPerAsset,
      portfolioData: state => state.portfolios.portfolioData,
      hasNewData: state => state.hasNewData,
      isLoading: state => state.isLoading,
      appCreated: state => state.appCreated
    }),
    
    ...mapGetters({
      isEmpty: 'isEmpty',
      lastPortfolio: 'lastPortfolio',
      allStocks: 'allStocks'
    })
  },

  // Computes the statistics on the portfolios/options data when the component
  // is created
  async created() {
    await this.$store.dispatch('getStocksData', this.allStocks)
    this.$store.dispatch('computeStats', this.portfolioData)
  },

  methods: {
    displayText(num) {
      return (!num) ? 0 : num
    }
  }
}
</script>
