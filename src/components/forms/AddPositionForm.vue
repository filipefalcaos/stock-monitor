<template>
  <form @submit.prevent="submitPosition">
    <div
      class="modal-card"
      style="width: 450px;"
    >
      <section class="modal-card-body modal-border-top">
        <b-field label="Ativo">
          <b-input
            v-model="asset"
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
            v-model="initialPrice"
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
              v-model="assetType"
              name="assetType"
              native-value="stock"
              required
            >
              Ação
            </b-radio>
            <b-radio
              v-model="assetType"
              name="assetType"
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
              v-model="direction"
              name="direction"
              native-value="long"
              required
            >
              Comprado
            </b-radio>
            <b-radio
              v-model="direction"
              name="direction"
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
      asset: '',
      amount: null,
      initialPrice: null,
      assetType: null,
      direction: null
    }
  },
  
  methods: {
    // Triggers the "submit-position" event to the parent component when the form is submitted,
    // with the new position as payload
    submitPosition() {
      let newPosition = {
        asset: this.asset.toUpperCase(),
        amount: parseInt(this.amount),
        initialPrice: parseFloat(this.initialPrice),
        assetType: this.assetType,
        direction: this.direction
      }
      
      this.$parent.close()
      this.$emit('submit-position', newPosition)
    }
  }
}
</script>
