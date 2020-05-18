<!-- Template -->
<template>
  <form @submit.prevent="submit_new_stock">
    <div class="modal-card" style="width: 450px;">
      <section class="modal-card-body modal-border-top">
        <b-field label="Ativo">
          <b-autocomplete
            v-model="stock"
            :data="filtered_stocks"
            field="code"
            placeholder="PETR4"
            clearable
            required
            @select="option => selected = option"
          >
            <template slot="empty">Sem resultados</template>
          </b-autocomplete>
        </b-field>

        <b-field label="Quantidade">
          <b-input v-model="amount" placeholder="100" type="number" min="0" required></b-input>
        </b-field>

        <b-field label="Preço Comprado">
          <b-input
            v-model="initial_price"
            placeholder="20,00"
            type="number"
            step="0.01"
            min="0"
            required
          ></b-input>
        </b-field>

        <b-field label="Posição">
          <div class="block">
            <b-radio v-model="position" name="position" native-value="opening" required>Comprado</b-radio>
            <b-radio v-model="position" name="position" native-value="closing" required>Vendido</b-radio>
          </div>
        </b-field>
      </section>

      <footer class="modal-card-foot">
        <button @click="$parent.close()" class="button" type="button">Cancelar</button>
        <button type="submit" class="button is-info">Adicionar</button>
      </footer>
    </div>
  </form>
</template>

<!-- Script -->
<script>
export default {
  name: "stock-form",
  props: ["stocks"],

  data() {
    return {
      stock: "",
      selected: null,
      amount: null,
      initial_price: null,
      position: null
    };
  },

  computed: {
    filtered_stocks() {
      return this.stocks.filter(option => {
        return (
          option.code
            .toString()
            .toLowerCase()
            .indexOf(this.stock.toLowerCase()) >= 0
        );
      });
    }
  },

  methods: {
    submit_new_stock() {
      let newStock = {
        stock: this.selected,
        amount: this.amount,
        initial_price: this.initial_price,
        position: this.position
      };

      /* Closes the modal and sends the data to MainPage */
      this.$parent.close();
      this.$emit("submit-stock", newStock);
    }
  }
};
</script>
