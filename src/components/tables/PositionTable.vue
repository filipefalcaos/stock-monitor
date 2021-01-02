<template>
  <div>
    <h6 v-if="positionData.length == 0 || !positionData">
      Sem posições listadas.
    </h6>

    <b-table
      v-else
      :data="positionData"
      :checked-rows.sync="checkedRows"
      :checkable="hasActions"
      :paginated="isPaginated"
      :per-page="pages"
      :row-class="(row, index) => hasNewData && 'green-success'"
      :default-sort="sortParams[0]"
      :default-sort-direction="sortParams[1]"
      mobile-cards
      hoverable
      striped
    >
      <b-table-column
        v-slot="props"
        field="createdAt"
        label="Abertura"
        sortable
      >
        <span v-if="props.row.createdAt">
          {{ $dateUtils.formatDate(props.row.createdAt) }}
        </span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="closedAt"
        label="Encerramento"
        sortable
      >
        <span v-if="props.row.closedAt">
          {{ $dateUtils.formatDate(props.row.closedAt) }}
        </span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="asset"
        label="Ativo"
        sortable
      >
        {{ props.row.asset }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="initialPrice"
        label="Preço Inicial"
        sortable
        numeric
      >
        {{ $utils.formatCurrency(props.row.initialPrice) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="amount"
        label="Quantidade"
        sortable
        numeric
      >
        {{ props.row.amount }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="currentPrice"
        label="Último Preço"
        sortable
        numeric
      >
        <span
          v-if="props.row.currentPrice"
        >{{ $utils.formatCurrency(props.row.currentPrice) }}</span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="varpct"
        label="Variação Diária"
        sortable
        numeric
      >
        <span
          v-if="props.row.var"
        >{{ $utils.formatCurrency(props.row.var) }} ({{ $utils.formatPercent(props.row.varpct) }})</span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="resultpct"
        label="Resultado"
        sortable
        numeric
      >
        <span v-if="props.row.result !== undefined && props.row.dividends !== undefined">
          {{ $utils.formatCurrency(props.row.result) }} ({{ $utils.formatPercent(props.row.resultpct) }})
          <b-tooltip 
            type="is-light"
            :label="$utils.formatCurrency(props.row.dividends).concat(' de proventos')"
          >
            <CIcon name="cil-info" />
          </b-tooltip>
        </span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="direction"
        label="Posição"
        sortable
        numeric
      >
        <span
          v-if="props.row.direction === 'long'"
          class="tag is-success"
        >
          Comprado
        </span>
        <span
          v-else
          class="tag is-warning"
        >
          Vendido
        </span>
      </b-table-column>
      
      <template 
        v-if="hasActions" 
        slot="bottom-left"
      >
        <div
          v-if="checkedRows.length > 0"
          class="buttons"
        >
          <CButtonToolbar>
            <CButtonGroup
              v-if="showAllOptions"
              class="mx-1 d-sm-down-none"
            >
              <CButton
                v-if="showAllOptions"
                color="info"
                @click="movePosition"
              >
                <CIcon name="cil-arrow-circle-right" />&nbsp;Mover
              </CButton>
            </CButtonGroup>
            <CButtonGroup
              v-if="showAllOptions"
              class="mx-1 d-sm-down-none"
            >
              <CButton
                color="warning"
                @click="closePosition"
              >
                <CIcon name="cil-ban" />&nbsp;Encerrar
              </CButton>
            </CButtonGroup>
            <CButtonGroup class="mx-1 d-sm-down-none">
              <CButton
                color="danger"
                @click="deletePositions"
              >
                <CIcon name="cil-trash" />&nbsp;Excluir
              </CButton>
            </CButtonGroup>
          </CButtonToolbar>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  name: 'PositionTable',
  props: {
    positionData: {
      type: Array,
      default: () => []
    },
    hasNewData: {
      type: Boolean,
      default: false
    },
    hasActions: {
      type: Boolean,
      default: true
    },
    sortParams: {
      type: Array,
      default: () => ['createdAt', 'desc']
    }
  },

  data() {
    return {
      checkedRows: [],
      pages: 6
    }
  },

  computed: {
    isPaginated() {
      return this.positionData.length > this.pages
    },

    showAllOptions() {
      return this.checkedRows.length === 1 && !this.checkedRows[0].closed
    }
  },
  
  methods: {
    // Triggers the "close-position" event to the parent component with the only checked row as
    // payload
    closePosition() {
      this.$store.commit('set', ['selPosition', this.checkedRows[0]])
      this.$emit('close-position')
      this.checkedRows = []
    },

    // Triggers the "move-position" event to the parent component with the only checked row as
    // payload
    movePosition() {
      this.$store.commit('set', ['selPosition', this.checkedRows[0]])
      this.$emit('move-position')
      this.checkedRows = []
    },
    
    // Triggers the "move-position" event to the parent component when the dialog is confirmed,
    // with all checked rows as payload
    deletePositions() {
      this.$buefy.dialog.confirm({
        message: 'Tem certeza que gostaria de excluir as ações selecionadas? Isto não poderá ser desfeito.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'is-danger',
        onConfirm: () => {
          this.$store.commit('set', ['selPosition', this.checkedRows])
          this.$emit('delete-positions')
          this.checkedRows = []
        },
        onCancel: () => (this.checkedRows = [])
      })
    }
  }
}
</script>

<style>
tr.green-success {
  color: #2EB85C;
}
</style>
