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
      :checked-rows.sync="checkedRows"
      mobile-cards
      hoverable
      striped
      checkable
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
          :class="{ 'green-success': hasNewData }"
          field="current_price"
          label="Preço Atual"
          :numeric="true"
        >
          <span v-if="props.row.current_price">{{ $parent.format_num(props.row.current_price) }}</span>
          <span v-else>--</span>
        </b-table-column>

        <b-table-column
          :class="{ 'green-success': hasNewData }"
          field="var"
          label="Variação Diária"
          :numeric="true"
        >
          <span
            v-if="props.row.var"
          >{{ $parent.format_num(props.row.var) }} ({{ props.row.varpct }}%)</span>
          <span v-else>--</span>

          <span v-if="props.row.var > 0">📈</span>
          <span v-else-if="props.row.var < 0">📉</span>
        </b-table-column>

        <b-table-column
          :class="{ 'green-success': hasNewData }"
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

        <b-table-column field="position" label="Posição" :numeric="true">
          <span v-if="props.row.position === 'opening'" class="tag is-success">Comprado</span>
          <span v-else class="tag is-warning">Vendido</span>
        </b-table-column>

        <b-table-column field="closed" label="Status" :numeric="true">
          <span v-if="!props.row.closed" class="tag is-success">Ativo</span>
          <span v-else class="tag is-warning">Encerrado</span>
        </b-table-column>
      </template>

      <template slot="bottom-left">
        <div v-if="checkedRows.length > 0" class="buttons">
          <b-button @click="close_stocks" type="is-warning" icon-left="cancel">Encerrar</b-button>
          <b-button @click="delete_stocks" type="is-danger" icon-left="delete">Excluir</b-button>
        </div>
      </template>
    </b-table>
  </div>
</template>

<!-- Script -->
<script>
export default {
  name: "stock-table",
  props: ["stockData", "hasNewData"],

  data() {
    return {
      process: process,
      checkedRows: []
    };
  },

  methods: {
    get_result_percent(stock) {
      let result = stock.result / (stock.initial_price * stock.amount);
      return (result * 100).toFixed(2);
    },

    close_stocks() {
      this.$buefy.dialog.confirm({
        message: 'Tem certeza que gostaria de encerrar as ações selecionadas?',
        confirmText: 'Encerrar',
        cancelText: 'Cancelar',
        type: 'is-warning',
        onConfirm: () => this.$emit('close-stocks', this.checkedRows)
      });
    },

    delete_stocks() {
      this.$buefy.dialog.confirm({
        message: 'Tem certeza que gostaria de excluir as ações selecionadas? Isto não poderá ser desfeito.',
        confirmText: 'Excluir',
        cancelText: 'Cancelar',
        type: 'is-danger',
        onConfirm: () => this.$emit('delete-stocks', this.checkedRows)
      });
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
