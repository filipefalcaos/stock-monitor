<template>
  <form @submit.prevent="close_position">
    <div
      class="modal-card"
      style="width: 450px;"
    >
      <section class="modal-card-body modal-border-top">
        <b-field label="Ação">
          {{ toClose.stock }}
        </b-field>

        <b-field label="Quantidade">
          <b-input
            v-model="amount"
            placeholder="100"
            type="number"
            min="0"
            :max="toClose.amount"
            required
          />
        </b-field>

        <b-field label="Preço de Encerramento">
          <b-input
            v-model="close_price"
            placeholder="20,00"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </b-field>
      </section>

      <footer class="modal-card-foot">
        <button
          class="button"
          type="button"
          @click="$parent.close()"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="button is-warning"
        >
          Encerrar
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ClosePositionForm',
  props: {
    toClose: {
      type: Object,
      default: () => {}
    }
  },
  
  data() {
    return {
      amount: null,
      close_price: null
    }
  },
  
  methods: {
    close_position() {
      this.$parent.close()
      this.$emit('update-position', {
        new_amount: this.amount,
        close_price: this.close_price,
        old_position: JSON.parse(JSON.stringify(this.toClose))
      })
    }
  }
}
</script>
