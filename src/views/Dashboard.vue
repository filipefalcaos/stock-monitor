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
        <CRow align-vertical="center">
          <CCol lg="10">
            <h4 class="mb-0 ml-1">
              P&L - Carteiras de ativos
            </h4>
          </CCol>
          
          <CCol lg="2">
            <b-select
              v-model="selectedPortfolio"
              placeholder="Agregado"
              expanded
              @input="loadNewStats"
            >
              <option
                v-for="option in portfolioOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </b-select>
          </CCol>
        </CRow>
        
        <cumsum-chart
          :dataset="cumulativeSum"
          :labels="cumulativeSumLabels"
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

  data() {
    return {
      selectedPortfolio: 'allportfolios',
      portfolioOptions: []
    }
  },

  computed: {
    ...mapState({
      cumulativeSum: state => state.stats.cumulativeSum,
      cumulativeSumLabels: state => state.stats.cumulativeSumLabels,
      operationsCount: state => state.stats.operationsCount,
      overallResults: state => state.stats.overallResults,
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
      allAssets: 'allAssets',
      allPositions: 'allPositions'
    })
  },

  // Gets the latest data on all assets when the Dashboard is created. Then, computes the
  // statistics on the portfolios/options data
  async created() {
    this.makePortfolioOptions()
    await this.$store.dispatch('getAssetsData', this.allAssets)
    let payload = {portfolioData: this.portfolioData, positions: this.allPositions}
    this.$store.dispatch('computeStats', payload)
  },

  methods: {
    displayText(num) {
      return (!num) ? 0 : num
    },

    // Loads the selected portfolio and compute its P&L stats. If the selected portfolio is
    // 'allportfolios', compute the aggregate P&L of all portfolios
    loadNewStats() {
      if (this.selectedPortfolio === 'allportfolios') {
        this.$store.commit('computeCumSum', this.allPositions)
      } else {
        let selPortfolio = this.portfolioData.portfolios.filter(p => p.id === this.selectedPortfolio)
        let positions = selPortfolio[0].positions
        this.$store.commit('computeCumSum', positions)
      }
    },

    // Sets the options of portfolios to select for P&L stats
    makePortfolioOptions() {
      this.portfolioOptions.push({id: 'allportfolios', name: 'AGREGADO'})
      this.portfolioData.portfolios.forEach(p => this.portfolioOptions.push({id: p.id, name: p.name}))
    }
  }
}
</script>
