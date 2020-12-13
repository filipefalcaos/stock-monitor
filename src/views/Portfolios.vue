<template>
  <div v-if="!isEmpty">
    <CRow align-vertical="center">
      <CCol sm="2">
        <b-select
          v-model="portfolioData.last_portfolio"
          placeholder="Carteira"
          expanded
          @input="loadPortfolio"
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
          <b>Ativo: </b>
          <span style="margin-right: 0.5rem;">{{ $utils.formatCurrency(activeInvestment) }}</span>
          <span>|</span>

          <b
            v-if="hasError"
            style="margin-left: 0.5rem; text-align: justify;"
          >
            Resultados indisponíveis
          </b>
          <span v-else>
            <b style="margin-left: 0.5rem;">Resultado:</b>
            {{ $utils.formatCurrency(finalResult) }}
            <span>|</span>
            <b style="margin-left: 0.5rem;">Proventos:</b>
            {{ $utils.formatCurrency(finalDividends) }} ({{ $utils.formatPercent(finalDividends / finalResult) }})
          </span>
        </h5>
      </CCol>
    </CRow>

    <CRow
      class="mt-2"
      align-vertical="center"
    >
      <CCol
        sm="4"
        class="d-none d-md-block"
      >
        <div style="float: left;">
          <CButton
            color="info"
            :disabled="isLoading"
            @click="$store.dispatch('getStockPrices')"
          >
            <CIcon name="cil-sync" />&nbsp;
            <span v-if="isLoading">Atualizando...</span>
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
            @click="modalAddActive = true"
          >
            <CIcon name="cil-plus" />
            Novo Ativo
          </CButton>

          <CDropdown 
            placement="bottom-end"
            toggler-text="Ações" 
            color="secondary"
          >
            <CDropdownItem @click="addPortfolioDialog">
              Nova Carteira
            </CDropdownItem>
            <CDropdownItem @click="editPortfolioDialog">
              Editar Carteira
            </CDropdownItem>
            <CDropdownItem @click="deletePortfolioDialog">
              Excluir Carteira
            </CDropdownItem>
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
              Posições em aberto
            </h4>
          </CCol>
        </CRow>

        <!-- Table of open positions -->
        <position-table
          class="mt-3"
          :position-data="openPositions"
          :has-new-data="hasNewData"
          @close-position="closePositionDialog"
          @move-position="movePositionDialog"
          @delete-positions="deletePositions"
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
              Posições encerradas
            </h4>
          </CCol>
        </CRow>

        <!-- Table of closed positions -->
        <position-table
          class="mt-3"
          :position-data="closedPositions"
          :has-new-data="hasNewData"
          @move-position="movePositionDialog"
          @delete-positions="deletePositions"
        />
      </CCardBody>
    </CCard>

    <!-- Modal to add positions -->
    <b-modal
      :active.sync="modalAddActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <add-position-form @submit-position="addPosition" />
    </b-modal>

    <!-- Modal to close positions -->
    <b-modal
      :active.sync="modalCloseActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <close-position-form
        :position="selectedPosition"
        @update-position="closePosition"
      />
    </b-modal>

    <b-modal
      :active.sync="modalMoveActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <move-position-form
        :position="selectedPosition"
        @move-position="movePosition"
      />
    </b-modal>
  </div>

  <div v-else>
    <h5>Não há carteiras cadastradas. Cadastre sua primeira carteira utilizando o botão abaixo.</h5>
    <CButton
      color="success"
      @click="addPortfolioDialog"
    >
      Nova Carteira
    </CButton>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import AddPositionForm from '../components/forms/AddPositionForm'
import ClosePositionForm from '../components/forms/ClosePositionForm'
import MovePositionForm from '../components/forms/MovePositionForm'
import PositionTable from '../components/tables/PositionTable'

export default {
  name: 'Portfolios',
  components: {
    AddPositionForm,
    ClosePositionForm,
    MovePositionForm,
    PositionTable
  },

  data() {
    return {
      modalAddActive: false,
      modalCloseActive: false,
      modalMoveActive: false,
      selectedPosition: null
    }
  },

  computed: {
    ...mapState({
      currentPositions: state => state.portfolios.currentPositions,
      dataFileName: state => state.portfolios.dataFileName,
      finalResult: state => state.portfolios.finalResult,
      finalDividends: state => state.portfolios.finalDividends,
      hasError: state => state.hasError,
      hasNewData: state => state.hasNewData,
      isLoading: state => state.isLoading,
      portfolioData: state => state.portfolios.portfolioData
    }),
    
    ...mapGetters({
      activeInvestment: 'activeInvestment',
      closedPositions: 'closedPositions',
      isEmpty: 'isEmpty',
      lastPortfolio: 'lastPortfolio',
      openPositions: 'openPositions'
    })
  },
  
  // Gets the latest stock prices when the component is created and initializes 
  // the portfolios UI
  async created() {
    if (!this.isEmpty) {
      await this.$store.dispatch('getStockPrices')
      await this.$store.dispatch('getDividendsHistory')
    }
  },

  methods: {
    async loadPortfolio() {
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      await this.$store.dispatch('getStockPrices')
      await this.$store.dispatch('getDividendsHistory')
    },

    createPortfolio(portfolio_name) {
      this.percent_result = 0
      this.$store.commit('newPortfolio', portfolio_name)
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
    },

    addPortfolioDialog() {
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
        onConfirm: value => this.createPortfolio(value)
      })
    },

    editPortfolio(portfolio_id, portfolio_name) {
      let payload = {id: portfolio_id, name: portfolio_name}
      this.$store.commit('editPortfolio', payload)
      this.$store.commit('updateDataFile')
    },

    editPortfolioDialog() {
      this.$buefy.dialog.prompt({
        message: 'Forneça um nome para a carteira.',
        inputAttrs: {
          placeholder: 'Nome da Carteira',
          value: this.lastPortfolio.name,
          maxlength: 30
        },
        confirmText: 'Editar',
        cancelText: 'Cancelar',
        trapFocus: true,
        type: 'is-info',
        onConfirm: value => this.editPortfolio(this.lastPortfolio.id, value)
      })
    },

    async deletePortfolio(portfolio_id) {
      this.$store.commit('deletePortfolio', portfolio_id)
      this.$store.commit('updateDataFile')

      if (!this.isEmpty) {
        this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
        await this.$store.dispatch('getStockPrices')
        await this.$store.dispatch('getDividendsHistory')
      }
    },

    deletePortfolioDialog() {
      this.$buefy.dialog.confirm({
        message: 'Tem certeza que gostaria de excluir a carteira? Isto não poderá ser desfeito.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'is-danger',
        onConfirm: () => this.deletePortfolio(this.lastPortfolio.id)
      })
    },

    async addPosition(newPosition) {
      this.$store.commit('addPosition', newPosition)
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      await this.$store.dispatch('getStockPrices')
      await this.$store.dispatch('getDividendsHistory')
    },

    async closePosition(closeObj) {
      this.$store.commit('closePosition', closeObj)
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      await this.$store.dispatch('getStockPrices')
      await this.$store.dispatch('getDividendsHistory')
    },

    closePositionDialog(position) {
      this.selectedPosition = position
      this.modalCloseActive = true
    },

    async movePosition(moveObj) {
      this.$store.commit('movePosition', moveObj)
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      await this.$store.dispatch('getStockPrices')
      await this.$store.dispatch('getDividendsHistory')
    },

    movePositionDialog(position) {
      this.selectedPosition = position
      this.modalMoveActive = true
    },

    async deletePositions(positions) {
      this.$store.commit('deletePosition', positions)
      this.$store.commit('updateDataFile')
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
      await this.$store.dispatch('getStockPrices')
      await this.$store.dispatch('getDividendsHistory')
    }
  }
}
</script>
