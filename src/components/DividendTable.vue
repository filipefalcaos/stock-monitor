<template>
  <div>
    <h6 v-if="dividendData.length == 0 || !dividendData">
      Sem proventos listados.
    </h6>

    <b-table
      v-else
      :data="dividendData"
      :paginated="isPaginated"
      :per-page="pages"
      :row-class="(row, index) => hasNewData && 'green-success'"
      default-sort="ed"
      default-sort-direction="desc"
      mobile-cards
      hoverable
      striped
    >
      <b-table-column
        v-slot="props"
        field="ed"
        label="Ex-dividendos"
        sortable
      >
        {{ $utils.formatDate(props.row.ed) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="pd"
        label="Pagamento"
        sortable
      >
        {{ $utils.formatDate(props.row.pd) }}
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
        field="value"
        label="Valor Unitário"
        sortable
        numeric
      >
        {{ $utils.formatCurrency(props.row.value, 5) }}
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
        field="positions"
        label="Posições"
        sortable
        numeric
      >
        {{ props.row.positions }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="result"
        label="Rendimento Total"
        sortable
        numeric
      >
        {{ $utils.formatCurrency(props.row.result) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="type"
        label="Tipo"
        sortable
        numeric
      >
        <span
          v-if="props.row.type === 'Dividendo'"
          class="tag is-success"
        >
          Dividendo
        </span>
        <span
          v-else-if="props.row.type === 'Juros Sobre Capital Próprio'"
          class="tag is-warning"
        >
          Juros (JCP)
        </span>
        <span
          v-else
          class="tag is-light"
        >
          {{ props.row.type }}
        </span>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
export default {
  name: 'DividendTable',
  props: {
    dividendData: {
      type: Array,
      default: () => []
    },
    hasNewData: {
      type: Boolean,
      default: false
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
      return this.dividendData.length > this.pages
    }
  }
}
</script>

<style>
tr.green-success {
  color: #2EB85C;
}
</style>
