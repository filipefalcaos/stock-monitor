<!-- Template -->
<template>
  <div class="stock-table">
    <h1
      v-if="stockData.length == 0 || !stockData"
      class="title"
      :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
    >Não há ações para esta posição.</h1>

    <b-table
      v-else
      :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
      :data="stockData"
      :striped="true"
      :hoverable="true"
      :mobile-cards="true"
    >
      <template slot-scope="props">
        <b-table-column field="stock" label="Ação">{{ props.row.stock }}</b-table-column>

        <b-table-column
          field="initial_price"
          label="Preço Comprado"
          :numeric="true"
        >{{ $parent.format_num(props.row.initial_price) }}</b-table-column>

        <b-table-column field="amount" label="Quantidade" :numeric="true">{{ props.row.amount }}</b-table-column>

        <b-table-column
          :class="{ 'green-success': newData }"
          field="current_price"
          label="Preço Atual"
          :numeric="true"
        >
          <span v-if="props.row.current_price">{{ $parent.format_num(props.row.current_price) }}</span>
          <span v-else>--</span>
        </b-table-column>

        <b-table-column
          :class="{ 'green-success': newData }"
          field="var"
          label="Variação"
          :numeric="true"
        >
          <span v-if="props.row.var">{{ $parent.format_num(props.row.var) }} ({{ props.row.varpct }}%)</span>
          <span v-else>--</span>

          <span v-if="props.row.var > 0">📈</span>
          <span v-else-if="props.row.var < 0">📉</span>
        </b-table-column>

        <b-table-column
          :class="{ 'green-success': newData }"
          field="result"
          label="Resultado"
          :numeric="true"
        >
          <span
            v-if="props.row.result"
          >{{ $parent.format_num(props.row.result) }} ({{ get_result_percent(props.row) }}%)</span>
          <span v-else>--</span>

          <span v-if="props.row.result > 0">😀</span>
          <span v-else-if="props.row.result == 0">😐</span>
          <span v-else-if="props.row.result < 0">😢</span>
        </b-table-column>

        <b-table-column field="sold" label="Status" :numeric="true">
          <span v-if="!props.row.sold" class="tag is-success">Ativo</span>
          <span v-else class="tag is-warning">Encerrado</span>
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<!-- Script -->
<script>
export default {
  name: "stock-table",
  props: ["stockData", "newData"],
  
  data() {
    return {
      process: process
    };
  },

  methods: {
    get_result_percent(stock) {
      return ((stock.result / (stock.initial_price * stock.amount)) * 100).toFixed(2);
    }
  }
};
</script>

<!-- Styles -->
<style scoped>
  .stock-table {
    margin-top: -1rem;
  }
</style>
