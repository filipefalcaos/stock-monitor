<!-- Template -->
<template>
  <div>
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
        >
          <span v-if="props.row.current_price">R$ {{ props.row.current_price }}</span>
          <span v-else>--</span>
        </b-table-column>

        <b-table-column
          :class="{ 'green-success': newData }"
          field="var"
          label="Variação"
          :numeric="true"
        >
          <span v-if="props.row.var">R$ {{ props.row.var }} ({{ props.row.varpct}}%)</span>
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
          <span v-if="props.row.result">R$ {{ props.row.result }}</span>
          <span v-else>--</span>

          <span v-if="props.row.result > 0">😀</span>
          <span v-else-if="props.row.result == 0">😐</span>
          <span v-else-if="props.row.result < 0">😢</span>
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large"></b-icon>
            </p>
            <p>Nothing here.</p>
          </div>
        </section>
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
  }
};
</script>
