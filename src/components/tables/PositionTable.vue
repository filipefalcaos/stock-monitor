<template>
  <div>
    <h6 v-if="positionData.length == 0 || !positionData">
      Sem ações listadas.
    </h6>

    <b-table
      v-else
      :data="positionData"
      :checked-rows.sync="checkedRows"
      :checkable="hasActions"
      :row-class="(row, index) => hasNewData && 'green-success'"
      mobile-cards
      hoverable
      striped
    >
      <b-table-column
        v-slot="props"
        field="created_at"
        label="Abertura"
        sortable
      >
        <span v-if="props.row.created_at">
          {{ $utils.formatDate(props.row.created_at) }}
        </span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="closed_at"
        label="Encerramento"
        sortable
      >
        <span v-if="props.row.closed_at">
          {{ $utils.formatDate(props.row.closed_at) }}
        </span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="stock"
        label="Ação"
        sortable
      >
        {{ props.row.stock }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="initial_price"
        label="Preço Inicial"
        sortable
        numeric
      >
        {{ $utils.formatCurrency(props.row.initial_price) }}
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
        field="current_price"
        label="Último Preço"
        sortable
        numeric
      >
        <span
          v-if="props.row.current_price"
        >{{ $utils.formatCurrency(props.row.current_price) }}</span>
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
        <span
          v-if="props.row.result !== undefined"
        >{{ $utils.formatCurrency(props.row.result) }} ({{ $utils.formatPercent(props.row.resultpct) }})</span>
        <span v-else>--</span>
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="type"
        label="Posição"
        sortable
        numeric
      >
        <span
          v-if="props.row.type === 'long'"
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
    }
  },

  data() {
    return {
      checkedRows: []
    }
  },

  computed: {
    showAllOptions() {
      return this.checkedRows.length === 1 && !this.checkedRows[0].closed
    }
  },
  
  // Converts all initial prices to float, ensuring that the table ordering
  // works properly
  created() {
    this.positionData.forEach(position => {
      position.initial_price = parseFloat(position.initial_price)
    })
  },
  
  methods: {
    closePosition() {
      this.$emit('close-position', this.checkedRows[0])
      this.checkedRows = []
    },

    movePosition() {
      this.$emit('move-position', this.checkedRows[0])
      this.checkedRows = []
    },
    
    deletePositions() {
      this.$buefy.dialog.confirm({
        message: 'Tem certeza que gostaria de excluir as ações selecionadas? Isto não poderá ser desfeito.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'is-danger',
        onConfirm: () => {
          this.$emit('delete-positions', this.checkedRows)
          this.checkedRows = []
        },
        onCancel: () => (this.checkedRows = [])
      })
    }
  }
};
</script>

<style>
tr.green-success {
  color: #2EB85C;
}
</style>
