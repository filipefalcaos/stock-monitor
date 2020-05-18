<!-- Template -->
<template>
  <form @submit.prevent="close_position">
    <div class="modal-card" style="width: 450px;">
      <section class="modal-card-body modal-border-top">
        <b-field label="Ação">{{ toClose.stock }}</b-field>

        <b-field label="Quantidade">
          <b-input
            v-model="amount"
            placeholder="100"
            type="number"
            min="0"
            :max="toClose.amount"
            required
          ></b-input>
        </b-field>

        <b-field label="Preço de Encerramento">
          <b-input
            v-model="close_price"
            placeholder="20,00"
            type="number"
            step="0.01"
            min="0"
            required
          ></b-input>
        </b-field>
      </section>

      <footer class="modal-card-foot">
        <button @click="$parent.close()" class="button" type="button">Cancelar</button>
        <button type="submit" class="button is-warning">Encerrar</button>
      </footer>
    </div>
  </form>
</template>

<!-- Script -->
<script>
export default {
  name: "close-position-form",
  props: ["toClose"],

  data() {
    return {
      amount: null,
      close_price: null
    };
  },

  methods: {
    close_position() {
      this.$parent.close();
      this.$emit("update-position", {
        new_amount: this.amount,
        close_price: this.close_price,
        old_position: JSON.parse(JSON.stringify(this.toClose))
      });
    }
  }
};
</script>
