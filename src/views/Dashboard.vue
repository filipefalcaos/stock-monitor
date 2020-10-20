<template>
  <div>
    <CRow>
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
                      <strong class="h4">50</strong>
                    </CCallout>
                  </CCol>
                  <CCol sm="6">
                    <CCallout color="danger">
                      <small class="text-muted">Operações - Opções</small><br>
                      <strong class="h4">22</strong>
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
                      <strong class="h4">12%</strong>
                    </CCallout>
                  </CCol>
                  <CCol sm="6">
                    <CCallout color="success">
                      <small class="text-muted">CAGR - Opções</small><br>
                      <strong class="h4">15%</strong>
                    </CCallout>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
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
              P&L - Ações
            </h4>
          </CCol>
          
          <CCol
            sm="7"
            class="d-none d-md-block"
          >
            <CButtonGroup class="float-right mr-3">
              <CButton
                v-for="(value, key) in ['Day', 'Month', 'Year']"
                :key="key"
                color="outline-secondary"
                class="mx-0"
                :pressed="value === selected ? true : false"
                @click="selected = value"
              >
                {{ value }}
              </CButton>
            </CButtonGroup>
          </CCol>
        </CRow>
        
        <LineChart
          :data="stats.currentResults"
          :labels="stats.currentDates"
          title="P&L - Ações"
          style="height:300px; margin-top:20px;"
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
              P&L - Opções
            </h4>
          </CCol>
          
          <CCol
            sm="7"
            class="d-none d-md-block"
          >
            <CButtonGroup class="float-right mr-3">
              <CButton
                v-for="(value, key) in ['Day', 'Month', 'Year']"
                :key="key"
                color="outline-secondary"
                class="mx-0"
                :pressed="value === selected ? true : false"
                @click="selected = value"
              >
                {{ value }}
              </CButton>
            </CButtonGroup>
          </CCol>
        </CRow>

        <LineChart
          :data="stats.currentResults"
          :labels="stats.currentDates"
          title="P&L - Opções"
          style="height:300px; margin-top:20px;"
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
      stats: state => state.portfolios.stats
    }),
    
    ...mapGetters({
      lastPortfolio: 'lastPortfolio',
      lastPositions: 'lastPositions'
    })
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
    }
  }
}
</script>
