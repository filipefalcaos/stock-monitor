<template>
  <form @submit.prevent="closePosition">
    <div
      class="modal-card"
      style="width: 450px;"
    >
      <section class="modal-card-body modal-border-top">
        <b-field label="Ação">
          {{ position.asset }}
        </b-field>

        <b-field label="Quantidade">
          <b-input
            v-model="amount"
            placeholder="100"
            type="number"
            min="0"
            :max="position.amount"
            required
          />
        </b-field>

        <b-field label="Preço de Encerramento">
          <b-input
            v-model="closePrice"
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
    position: {
      type: Object,
      default: () => {}
    }
  },
  
  data() {
    return {
      amount: null,
      closePrice: null
    }
  },
  
  methods: {
    // Triggers the "update-position" event to the parent component when the form is submitted,
    // with the old position and the operation details as payload
    closePosition() {
      this.$parent.close()
      this.$emit('update-position', {
        new_amount: this.amount,
        closePrice: this.closePrice,
        old_position: JSON.parse(JSON.stringify(this.position))
      })
    }
  }
}
</script>
