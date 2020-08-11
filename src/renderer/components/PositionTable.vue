<!-- Template -->
<template>
  <div class="position-table">
    <h1
      v-if="positionData.length == 0 || !positionData"
      class="title"
      :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
    >Sem ações listadas.</h1>

    <b-table
      v-else
      :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
      :data="positionData"
      :checked-rows.sync="checkedRows"
      default-sort="stock"
      mobile-cards
      hoverable
      striped
      checkable
    >
      <template slot-scope="props">
        <b-table-column field="created_at" label="Abertura" sortable>
          <span v-if="props.row.created_at">
            {{ $parent.format_date(props.row.created_at) }}
          </span>
          <span v-else>--</span>
        </b-table-column>

        <b-table-column field="closed_at" label="Encerramento" sortable>
          <span v-if="props.row.closed_at">
            {{ $parent.format_date(props.row.closed_at) }}
          </span>
          <span v-else>--</span>
        </b-table-column>

        <b-table-column field="stock" label="Ação" sortable>{{ props.row.stock }}</b-table-column>

        <b-table-column
          field="initial_price"
          label="Preço Inicial"
          sortable
          numeric
        >{{ $parent.format_currency(props.row.initial_price) }}</b-table-column>

        <b-table-column field="amount" label="Quantidade" sortable numeric>{{ props.row.amount }}</b-table-column>

        <b-table-column
          :class="{ 'green-success': hasNewData }"
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
          :class="{ 'green-success': hasNewData }"
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
          :class="{ 'green-success': hasNewData }"
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

        <b-table-column field="type" label="Posição" sortable numeric>
          <span v-if="props.row.type === 'long'" class="tag is-success">Comprado</span>
          <span v-else class="tag is-warning">Vendido</span>
        </b-table-column>
      </template>

      <template slot="bottom-left">
        <div v-if="checkedRows.length > 0" class="buttons">
          <b-button
            v-if="checkedRows.length === 1 && !checkedRows[0].closed"
            @click="close_position"
            type="is-warning"
            icon-left="cancel"
          >Encerrar</b-button>
          <b-button @click="delete_positions" type="is-danger" icon-left="delete">Excluir</b-button>
        </div>
      </template>
    </b-table>
  </div>
</template>

<!-- Script -->
<script>
export default {
  name: "position-table",
  props: ["positionData", "hasNewData"],

  // Converts all initial prices to float, ensuring that the table ordering
  // works properly
  created() {
    this.positionData.forEach(position => {
      position.initial_price = parseFloat(position.initial_price);
    });
  },

  data() {
    return {
      process: process,
      checkedRows: []
    };
  },

  methods: {
    close_position() {
      this.$emit("close-position", this.checkedRows[0]);
      this.checkedRows = [];
    },

    delete_positions() {
      this.$buefy.dialog.confirm({
        message:
          "Tem certeza que gostaria de excluir as ações selecionadas? Isto não poderá ser desfeito.",
        confirmText: "Excluir",
        cancelText: "Cancelar",
        type: "is-danger",
        onConfirm: () => {
          this.$emit("delete-positions", this.checkedRows);
          this.checkedRows = [];
        },
        onCancel: () => (this.checkedRows = [])
      });
    }
  }
};
</script>

<!-- Styles -->
<style scoped>
.position-table {
  margin-top: -1rem;
}
</style>
