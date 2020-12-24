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
          :text="$utils.formatCurrency(displayText(overallResults.assets))"
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
            
            <dist-chart
              :dist="operationsPerAsset"
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
            
            <dist-chart
              :dist="investmentPerAsset"
              :is-currency="true"
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
            
            <dist-chart
              :dist="investmentPerAssetType"
              :is-currency="true"
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
import CumsumChart from '../components/charts/CumsumChart'
import DistChart from '../components/charts/DistChart'
import EmptyApp from '../components/utils/EmptyApp'

export default {
  name: 'Dashboard',
  components: {
    CumsumChart,
    DistChart,
    EmptyApp
  },

  computed: {
    ...mapState({
      cumulativeSum: state => state.stats.cumulativeSum,
      operationsCount: state => state.stats.operationsCount,
      overallResults: state => state.stats.overallResults,
      chartLabels: state => state.stats.chartLabels,
      operationsPerAsset: state => state.stats.operationsPerAsset,
      investmentPerAsset: state => state.stats.investmentPerAsset,
      investmentPerAssetType: state => state.stats.investmentPerAssetType,
      portfolioData: state => state.portfolios.portfolioData,
      hasNewData: state => state.hasNewData,
      isLoading: state => state.isLoading,
      appCreated: state => state.appCreated
    }),
    
    ...mapGetters({
      isEmpty: 'isEmpty',
      lastPortfolio: 'lastPortfolio',
      allAssets: 'allAssets'
    })
  },

  // Gets the latest data on all assets when the Dashboard is created. Then, computes the
  // statistics on the portfolios/options data
  async created() {
    await this.$store.dispatch('getAssetsData', this.allAssets)
    this.$store.dispatch('computeStats', this.portfolioData)
  },

  methods: {
    displayText(num) {
      return (!num) ? 0 : num
    }
  }
}
</script>
