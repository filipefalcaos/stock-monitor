<template>
  <div>
    <!-- <CRow>
      <CCol md="12">
        <CCard>
          <CCardBody>
            <CRow>
              <CCol sm="5">
                <h4
                  id="traffic"
                  class="card-title mb-0"
                >
                  Visão Geral
                </h4>
              </CCol>
            </CRow>
            
            <CRow>
              <CCol
                sm="12"
                lg="6"
              >
                <CRow>
                  <CCol sm="6">
                    <CCallout color="info">
                      <small class="text-muted">Operações - Ações</small><br>
                      <strong class="h4">--</strong>
                    </CCallout>
                  </CCol>
                  <CCol sm="6">
                    <CCallout color="danger">
                      <small class="text-muted">Operações - Opções</small><br>
                      <strong class="h4">--</strong>
                    </CCallout>
                  </CCol>
                </CRow>
              </CCol>
              <CCol
                sm="12"
                lg="6"
              >
                <CRow>
                  <CCol sm="6">
                    <CCallout color="warning">
                      <small class="text-muted">CAGR - Ações</small><br>
                      <strong class="h4">--</strong>
                    </CCallout>
                  </CCol>
                  <CCol sm="6">
                    <CCallout color="success">
                      <small class="text-muted">CAGR - Opções</small><br>
                      <strong class="h4">--</strong>
                    </CCallout>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow> -->

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
          :data="stats.currentResults"
          :labels="stats.currentDates"
          :title="lastPortfolio.name"
          style="height: 300px; margin-top: 20px;"
        />
        <h6 v-else>
          Sem informações disponíveis.
        </h6>
      </CCardBody>
    </CCard>

    <!-- <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="10">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              P&L - Opções
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
          :data="stats.currentResults"
          :labels="stats.currentDates"
          title="P&L - Opções"
          style="height:300px; margin-top: 20px;"
        />
        <h6 v-else>
          Sem informações disponíveis.
        </h6>
      </CCardBody>
    </CCard> -->
    
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
          :has-actions="false"
        />
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { format_currency, format_percent, format_date } from '../utils'
import LineChart from '../components/charts/LineChart'
import PositionTable from "../components/PositionTable"

export default {
  name: 'Dashboard',
  components: {
    LineChart,
    PositionTable
  },
  
  data() {
    return {
      selected: 'Month'
    }
  },

  computed: {
    ...mapState({
      stats: state => state.portfolios.stats,
      portfolioData: state => state.portfolios.portfolioData
    }),
    
    ...mapGetters({
      lastPortfolio: 'lastPortfolio',
      lastPositions: 'lastPositions',
      isEmpty: 'isEmpty'
    })
  },

  // Computes the statistics on the portfolios/options data when the component
  // is created
  created() {
    this.$store.commit('computeStats')
  },

  methods: {
    format_currency(num) {
      return format_currency(num)
    },

    format_percent(num) {
      return format_percent(num)
    },

    format_date(timestamp) {
      return format_date(timestamp)
    },

    load_portfolio() {
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      this.$store.commit('computeStats') // Updates the stats
      //this.$forceUpdate()
    },
  }
}
</script>
