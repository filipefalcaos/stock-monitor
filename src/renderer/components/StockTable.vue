<!-- Template -->
<template>
  <b-table
    :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
    :data="stockData"
    :striped="true"
    :hoverable="true"
    :mobile-cards="true"
  >
    <template slot-scope="props">
      <b-table-column field="stock" label="Ação">{{ props.row.stock }}</b-table-column>
      <b-table-column
        field="first_price"
        label="Preço Comprado"
        :numeric="true"
      >R$ {{ props.row.first_price }}</b-table-column>
      <b-table-column field="amount" label="Quantidade" :numeric="true">{{ props.row.amount }}</b-table-column>
      <b-table-column
        :class="{ 'green-success': newData }"
        field="current_price"
        label="Preço Atual"
        :numeric="true"
      >R$ {{ props.row.current_price }}</b-table-column>
      <b-table-column
        :class="{ 'green-success': newData }"
        field="var"
        label="Variação"
        :numeric="true"
      >
        R$ {{ props.row.var }} ({{ props.row.varpct}}%)
        <span v-if="props.row.var > 0">📈</span>
        <span v-else-if="props.row.var < 0">📉</span>
      </b-table-column>
      <b-table-column
        :class="{ 'green-success': newData }"
        field="result"
        label="Resultado"
        :numeric="true"
      >
        R$ {{ props.row.result }}
        <span v-if="props.row.result > 0">😀</span>
        <span v-else-if="props.row.result == 0">😐</span>
        <span v-else>😢</span>
      </b-table-column>
    </template>
  </b-table>
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
  }
};
</script>
