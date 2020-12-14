<template>
  <form @submit.prevent="submitPosition">
    <div
      class="modal-card"
      style="width: 450px;"
    >
      <section class="modal-card-body modal-border-top">
        <b-field label="Ativo">
          <b-input
            v-model="stock"
            placeholder="PETR4.SA"
            required
          />
        </b-field>

        <b-field label="Quantidade">
          <b-input
            v-model="amount"
            placeholder="100"
            type="number"
            min="0"
            required
          />
        </b-field>

        <b-field label="Preço Comprado">
          <b-input
            v-model="initial_price"
            placeholder="20,00"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </b-field>

        <b-field label="Tipo de Ativo">
          <div class="block">
            <b-radio
              v-model="asset"
              name="asset"
              native-value="stock"
              required
            >
              Ação
            </b-radio>
            <b-radio
              v-model="asset"
              name="asset"
              native-value="fii"
              required
            >
              Fundo Imobiliário
            </b-radio>
          </div>
        </b-field>

        <b-field label="Posição">
          <div class="block">
            <b-radio
              v-model="type"
              name="type"
              native-value="long"
              required
            >
              Comprado
            </b-radio>
            <b-radio
              v-model="type"
              name="type"
              native-value="short"
              required
            >
              Vendido
            </b-radio>
          </div>
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
          class="button is-info"
        >
          Adicionar
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  name: 'AddPositionForm',
  data() {
    return {
      stock: '',
      amount: null,
      initial_price: null,
      asset: null,
      type: null
    }
  },
  
  methods: {
    submitPosition() {
      let newPosition = {
        stock: this.stock.toUpperCase(),
        amount: this.amount,
        initial_price: this.initial_price,
        asset: this.asset,
        type: this.type
      }
      
      // Closes the modal and sends the data to MainPage
      this.$parent.close()
      this.$emit('submit-position', newPosition)
    }
  }
}
</script>
