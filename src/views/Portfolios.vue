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

  <!-- Displays the empty app message -->
  <empty-app v-else />
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import AddPositionForm from '../components/forms/AddPositionForm'
import ClosePositionForm from '../components/forms/ClosePositionForm'
import MovePositionForm from '../components/forms/MovePositionForm'
import DividendTable from '../components/tables/DividendTable'
import PositionTable from '../components/tables/PositionTable'
import EmptyApp from '../components/utils/EmptyApp'

export default {
  name: 'Portfolios',
  components: {
    AddPositionForm,
    ClosePositionForm,
    MovePositionForm,
    DividendTable,
    PositionTable,
    EmptyApp
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
  
  // Gets the latest data on the current assets when the Portfolios views is created
  created() {
    this.getLastData()
  },

  methods: {
    // Loads a selected portfolio into the application and gets the latest data on its assets
    loadPortfolio() {
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    // Opens a dialog for the name of a new portfolio. If confirmed, the portfolio is created and
    // then stored in the data file
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

    // Opens a dialog for editing the name of an existing portfolio. If confirmed, the portfolio's
    // name is updated
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

    // Opens a dialog to confirm the deletion of an existing portfolio. If confirmed, the
    // portfolio is delete
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

    // Adds a given position to the current portfolio
    addPosition(newPosition) {
      this.$store.commit('addPosition', newPosition)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    // Closes a given position on the current portfolio
    closePosition(closeObj) {
      this.$store.commit('closePosition', closeObj)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    // Moves a given position from the current portoflio to another existing portfolio
    movePosition(moveObj) {
      this.$store.commit('movePosition', moveObj)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    // Deletes the selected positions from the current portoflio
    deletePositions() {
      this.$store.commit('deletePosition', this.selPosition)
      this.$store.commit('updateDataFile')
      this.getLastData()
    },

    // Gets the latest data on the assets of the current portfolio
    async getLastData() {
      await this.$store.dispatch('getStocksData', this.currentStocks)
    }
  }
}
</script>
