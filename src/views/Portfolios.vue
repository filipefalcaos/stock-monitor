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
          <b
            v-if="hasError"
            style="margin-left: 0.5rem; text-align: justify;"
          >
            Resultados indisponíveis
          </b>
          <span v-else>
            <b style="margin-left: 0.5rem;">Res. Final:</b>
            {{ $utils.formatCurrency(finalResult) }}
            <span style="margin-left: 0.25rem;">|</span>
            <b style="margin-left: 0.5rem;">Prov. Recebidos:</b>
            {{ $utils.formatCurrency(finalDividends) }}
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
            @click="getLastData"
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
            Nova Posição
          </CButton>

          <CDropdown 
            placement="bottom-end"
            toggler-text="Ações" 
            color="secondary"
          >
            <CDropdownItem @click="newPortfolio">
              Nova Carteira
            </CDropdownItem>
            <CDropdownItem @click="editPortfolio">
              Editar Carteira
            </CDropdownItem>
            <CDropdownItem @click="deletePortfolio">
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
          @close-position="modalCloseActive = true"
          @move-position="modalMoveActive = true"
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
          :sort-params="['closed_at', 'desc']"
          @move-position="modalMoveActive = true"
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
              Proventos recebidos
            </h4>
          </CCol>
        </CRow>

        <!-- Table of dividends received -->
        <dividend-table
          class="mt-3"
          :dividend-data="receivedDividends"
          :has-new-data="hasNewData"
        />
      </CCardBody>
    </CCard>

    <!-- Modals to add, move, and close positions -->
    <b-modal
      :active.sync="modalAddActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <add-position-form @submit-position="addPosition" />
    </b-modal>

    <b-modal
      :active.sync="modalMoveActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <move-position-form
        :position="selPosition"
        @move-position="movePosition"
      />
    </b-modal>

    <b-modal
      :active.sync="modalCloseActive"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <close-position-form
        :position="selPosition"
        @update-position="closePosition"
      />
    </b-modal>
  </div>

  <div 
    v-else
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
import AddPositionForm from '../components/AddPositionForm'
import ClosePositionForm from '../components/ClosePositionForm'
import MovePositionForm from '../components/MovePositionForm'
import DividendTable from '../components/DividendTable'
import PositionTable from '../components/PositionTable' 

export default {
  name: 'Portfolios',
  components: {
    AddPositionForm,
    ClosePositionForm,
    MovePositionForm,
    DividendTable,
    PositionTable
  },

  data() {
    return {
      modalAddActive: false,
      modalCloseActive: false,
      modalMoveActive: false
    }
  },

  computed: {
    ...mapState({
      portfolioData: state => state.portfolios.portfolioData,
      dataFileName: state => state.portfolios.dataFileName,
      finalResult: state => state.portfolios.finalResult,
      finalDividends: state => state.portfolios.finalDividends,
      selPosition: state => state.selPosition,
      hasError: state => state.hasError,
      hasNewData: state => state.hasNewData,
      isLoading: state => state.isLoading
    }),
    
    ...mapGetters({
      activeInvestment: 'activeInvestment',
      closedPositions: 'closedPositions',
      isEmpty: 'isEmpty',
      lastPortfolio: 'lastPortfolio',
      openPositions: 'openPositions',
      currentStocks: 'currentStocks',
      receivedDividends: 'receivedDividends'
    })
  },
  
  // Gets the latest stock prices when the component is created 
  created() {
    if (!this.isEmpty) this.getLastData()
  },

  methods: {
    loadPortfolio() {
      this.$store.commit('updateDataFile')
      this.getLastData()
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
        }
      })
    },

    editPortfolio() {
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
        onConfirm: value => {
          let payload = {id: this.lastPortfolio.id, name: value}
          this.$store.commit('editPortfolio', payload)
          this.$store.commit('updateDataFile')
        }
      })
    },

    deletePortfolio() {
      this.$buefy.dialog.confirm({
        message: 'Tem certeza que gostaria de excluir a carteira? Isto não poderá ser desfeito.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'is-danger',
        onConfirm: () => {
          this.$store.commit('deletePortfolio', this.lastPortfolio.id)
          this.$store.commit('updateDataFile')
          if (!this.isEmpty) this.getLastData()
        }
      })
    },

    addPosition(newPosition) {
      this.$store.commit('addPosition', newPosition)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    closePosition(closeObj) {
      this.$store.commit('closePosition', closeObj)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    movePosition(moveObj) {
      this.$store.commit('movePosition', moveObj)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    deletePositions() {
      this.$store.commit('deletePosition', this.selPosition)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    async getLastData() {
      await this.$store.dispatch('getStocksData', this.currentStocks)
    }
  }
}
</script>
