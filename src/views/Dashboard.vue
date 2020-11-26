<template>
  <div>
    <b-loading v-model="isLoading" />

    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="10">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              P&L - Ações
            </h4>
          </CCol>
          
          <CCol
            sm="2"
            class="d-none d-md-block"
          >
            <div style="float: right;">
              <b-select
                v-model="portfolioData.last_portfolio"
                placeholder="Carteira"
                expanded
                @input="load_portfolio"
              >
                <option
                  v-for="option in portfolioData.portfolios"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.name }}
                </option>
              </b-select>
            </div>
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
              Últimas Operações
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
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import LineChart from '../components/charts/LineChart'
import PositionTable from '../components/tables/PositionTable'

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    PositionTable
  },

  computed: {
    ...mapState({
      cumulativeSum: state => state.stats.cumulativeSum,
      currentPositions: state => state.portfolios.currentPositions,
      hasNewData: state => state.hasNewData,
      isLoading: state => state.isLoading,
      portfolioData: state => state.portfolios.portfolioData
    }),
    
    ...mapGetters({
      isEmpty: 'isEmpty',
      lastPortfolio: 'lastPortfolio',
      lastPositions: 'lastPositions'
    })
  },

  // Computes the statistics on the portfolios/options data when the component
  // is created
  created() {
    this.$store.dispatch('getStockPrices').then(() => {
      this.computeStats()
    })
  },

  methods: {
    computeStats() {
      let payload = {currentPositions: this.currentPositions, lastPortfolio: this.lastPortfolio}
      this.$store.commit('computeCumSum', payload) // Updates the stats
    },

    load_portfolio() {
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      this.computeStats()
    },
  }
}
</script>
