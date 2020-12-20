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

  <div 
    v-else-if="isEmpty"
    style="min-height: 85vh; display: flex;"
    class="flex-row align-items-center"
  >
    <CContainer>
      <CRow class="justify-content-center">
        <CCol
          lg="6"
          class="text-center"
        >
          <figure style="margin-bottom: 1.5rem;">
            <img
              width="150px"
              src="../assets/stock-market.png"
            >
          </figure>

          <h5 style="margin-bottom: 1.5rem;">
            Ainda não há carteiras de ativos ou operações de opções cadastradas.
            Comece agora a acompanhar seus investimentos!
          </h5>

          <CButton
            color="success"
            @click="newPortfolio"
          >
            <CIcon name="cil-plus" />
            Nova Carteira
          </CButton>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import CumsumChart from '../components/CumsumChart'
import FrequencyChart from '../components/FrequencyChart'

export default {
  name: 'Dashboard',
  components: { CumsumChart, FrequencyChart },

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
    },

    newPortfolio() {
      this.$buefy.dialog.prompt({
        message: 'Forneça um nome para a nova carteira.',
        inputAttrs: {
          placeholder: 'Nome da Carteira',
          maxlength: 30
        },
        confirmText: 'Adicionar',
        cancelText: 'Cancelar',
        trapFocus: true,
        type: 'is-info',
        onConfirm: value => {
          this.$store.commit('newPortfolio', value)
          this.$store.commit('updateDataFile')
          this.$router.push({ name: 'Carteiras' })
        }
      })
    }
  }
}
</script>
