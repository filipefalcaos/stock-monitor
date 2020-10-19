<template>
  <div>
    <CRow align-vertical="center">
      <CCol sm="2">
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
      </CCol>
            
      <CCol
        sm="10"
        class="d-none d-md-block"
      >
        <h5 style="float: right; font-size: 1rem; margin-bottom: 0;">
          <b>Total: </b>
          <span style="margin-right: 0.5rem;">{{ format_currency(investment) }}</span>
          <span>|</span>

          <b style="margin-left: 0.5rem;">Ativo: </b>
          <span style="margin-right: 0.5rem;">{{ format_currency(activeInvestment) }}</span>
          <span>|</span>

          <b
            v-if="has_error"
            style="margin-left: 0.5rem; text-align: justify;"
          >
            Resultados indisponíveis
          </b>
          <span v-else>
            <b style="margin-left: 0.5rem;">Resultado:</b>
            {{ format_currency(final_result) }} ({{ format_percent(percent_result) }})
          </span>
        </h5>
      </CCol>
    </CRow>

    <CRow class="mt-2">
      <CCol
        sm="4"
        class="d-none d-md-block"
      >
        <div style="float: left;">
          <CButton
            color="info"
            :disabled="is_processing"
            @click="get_stock_prices"
          >
            <CIcon name="cil-sync" />&nbsp;
            <span v-if="is_processing">Atualizando...</span>
            <span v-else>Atualizar</span>
          </CButton>
        </div>
      </CCol>

      <CCol
        sm="8"
        class="d-none d-md-block"
      >
        <div style="float: right;">
          <CButton
            style="margin-right: 12px;"
            color="success"
          >
            Novo Ativo
          </CButton>

          <CDropdown 
            placement="bottom-end"
            toggler-text="Ações" 
            color="secondary"
          >
            <CDropdownItem>Nova Carteira</CDropdownItem>
            <CDropdownItem>Editar Carteira</CDropdownItem>
            <CDropdownItem>Excluir Carteira</CDropdownItem>
          </CDropdown>
        </div>
      </CCol>
    </CRow>

    <CCard class="mt-4">
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              Em aberto
            </h4>
          </CCol>
        </CRow>

        <!-- Table of open positions -->
        <position-table
          class="mt-3"
          :position-data="openPositions"
          :has-new-data="has_new_data"
          @close-position="close_position_dialog"
          @delete-positions="delete_positions"
        />
      </CCardBody>
    </CCard>

    <CCard class="mt-2">
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4
              id="traffic"
              class="card-title mb-0"
            >
              Encerradas
            </h4>
          </CCol>
        </CRow>

        <!-- Table of closed positions -->
        <position-table
          class="mt-3"
          :position-data="closedPositions"
          :has-new-data="has_new_data"
          @close-position="close_position_dialog"
          @delete-positions="delete_positions"
        />
      </CCardBody>
    </CCard>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { format_currency, format_percent, format_date } from '../utils'
import PositionTable from '../components/PositionTable'

export default {
  name: 'Portfolios',
  components: {
    PositionTable
  },

  data() {
    return {
      has_new_data: false,
      is_processing: false,
      modal_add_active: false,
      modal_close_active: false,
      has_error: false,
      show_open: true,
      show_closed: false,
      final_result: 0,
      percent_result: 0,
      position_to_close: null
    }
  },

  computed: {
    ...mapState({
      dataFileName: state => state.portfolios.dataFileName,
      portfolioData: state => state.portfolios.portfolioData,
      currentPositions: state => state.portfolios.currentPositions
    }),
    
    ...mapGetters({
      lastPortfolio: 'lastPortfolio',
      investment: 'investment',
      activeInvestment: 'activeInvestment',
      openPositions: 'openPositions',
      closedPositions: 'closedPositions'
    })
  },
  
  // Gets the latest stock prices when the component is created and initializes 
  // the portfolios UI
  async created() {
    this.get_stock_prices()
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
      this.get_stock_prices()
    },

    close_position_dialog(position) {
      this.position_to_close = position
      this.modal_close_active = true
    },

    delete_positions(positions) {
      this.$store.commit('deletePosition', positions)
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      this.get_stock_prices()
    },

    get_stock_prices() {
      let promises = []
      let base_url = 'https://query2.finance.yahoo.com/v10/'
      this.is_processing = true
      this.has_error = false
      
      // Gets the most recent price of each stock
      this.currentPositions.forEach(position => {
        promises.push(
          this.$http
            .get(base_url + 'finance/quoteSummary/' + position.stock + '?modules=price')
            .then(response => {
              position.aux_price = response.data.quoteSummary.result[0].price.regularMarketPrice.raw
              position.aux_var = response.data.quoteSummary.result[0].price.regularMarketChange.raw
              position.aux_varpct = response.data.quoteSummary.result[0].price.regularMarketChangePercent.raw * 100
            })
        )
      })
      
      // After all prices are collected, update the UI
      Promise.all(promises)
        .then(() => {
          this.currentPositions.forEach(position => {
            if (position.closed) {
              position.current_price = position.close_price
            } else {
              position.current_price = position.aux_price
            }
            
            position.var = position.aux_var
            position.varpct = position.aux_varpct / 100
          })
          
          this.update_stock_prices()
          this.has_new_data = true
          this.is_processing = false
          setTimeout(() => { this.has_new_data = false }, 2000)
        })
        .catch(error => {
          error /* Unused */
          this.has_error = true
          if (this.is_processing) this.is_processing = false
          
          // Display an error message
          this.$buefy.notification.open({
            duration: 5000,
            message: 'Falha ao se conectar ao servidor. Por favor, cheque sua conexão.',
            position: 'is-bottom-right',
            type: 'is-danger'
          })
        })
    },

    update_stock_prices() {
      let sum = 0
      this.currentPositions.forEach(position => {
        if (position.type === 'long') {
          position.result = (position.current_price - position.initial_price) * position.amount
        } else {
          position.result = (position.initial_price - position.current_price) * position.amount
        }
        
        position.resultpct = position.result / (position.initial_price * position.amount)
        sum += parseFloat(position.result)
      });
      
      this.final_result = parseFloat(sum)
      if (this.investment === 0) {
        this.percent_result = 0
      } else {
        this.percent_result = sum / this.investment
      }
    }
  }
}
</script>
