<!-- Template -->
<template>
  <form action>
    <div class="modal-card" style="width: 450px;">
      <header class="modal-card-head">
        <p class="modal-card-title">Nova Ação</p>
      </header>

      <section class="modal-card-body">
        <b-field label="Ação">
          <b-autocomplete
            v-model="stock"
            :data="filtered_stocks"
            placeholder="PETR4"
            clearable
            required
            @select="option => selected = option"
          >
            <template slot="empty">No results found</template>
          </b-autocomplete>
        </b-field>

        <b-field label="Quantidade">
          <b-input :value="amount" placeholder="100" required></b-input>
        </b-field>

        <b-field label="Preço Comprado">
          <b-input :value="first_price" placeholder="20,00" required></b-input>
        </b-field>

        <h1>
          <b>Posição:</b>
          <span v-if="isBuying">Comprado</span>
          <span v-else>Vendido</span>
        </h1>
      </section>

      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">Cancelar</button>
        <button class="button is-info">Adicionar</button>
      </footer>
    </div>
  </form>
</template>

<!-- Script -->
<script>
export default {
  name: "stock-form",
  props: ["isBuying", "stocks"],

  created() {
    this.stocks.forEach(stock => {
      let code = stock.code.split(".")[0];
      this.codes.push(code);
    });
  },

  data() {
    return {
      stock: "",
      codes: [],
      selected: null,
      amount: null,
      first_price: null
    };
  },

  computed: {
    filtered_stocks() {
      return this.codes.filter((option) => {
        return (
          option
            .toString()
            .toLowerCase()
            .indexOf(this.stock.toLowerCase()) >= 0
        );
      });
    }
  }
};
</script>
