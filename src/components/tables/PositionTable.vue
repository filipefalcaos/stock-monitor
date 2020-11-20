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
          {{ $parent.format_date(props.row.created_at) }}
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
          {{ $parent.format_date(props.row.closed_at) }}
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
        {{ $parent.format_currency(props.row.initial_price) }}
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
        >{{ $parent.format_currency(props.row.current_price) }}</span>
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
        >{{ $parent.format_currency(props.row.var) }} ({{ $parent.format_percent(props.row.varpct) }})</span>
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
        >{{ $parent.format_currency(props.row.result) }} ({{ $parent.format_percent(props.row.resultpct) }})</span>
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
          <CButton
            v-if="checkedRows.length === 1 && !checkedRows[0].closed"
            color="warning"
            @click="close_position"
          >
            <CIcon name="cil-ban" />&nbsp;Encerrar
          </CButton>
          <CButton
            style="margin-left: 12px;"
            color="danger"
            @click="delete_positions"
          >
            <CIcon name="cil-trash" />&nbsp;Excluir
          </CButton>
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
  
  // Converts all initial prices to float, ensuring that the table ordering
  // works properly
  created() {
    this.positionData.forEach(position => {
      position.initial_price = parseFloat(position.initial_price)
    })
  },
  
  methods: {
    close_position() {
      this.$emit('close-position', this.checkedRows[0])
      this.checkedRows = []
    },
    
    delete_positions() {
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
