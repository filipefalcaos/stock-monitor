<template>
  <form @submit.prevent="movePosition">
    <div
      class="modal-card"
      style="width: 450px;"
    >
      <section class="modal-card-body modal-border-top">
        <label class="label">Detalhes</label>
        <p><b>Ação:</b> {{ position.asset }}</p>
        <p><b>Quantidade:</b> {{ position.amount }}</p>
        <p><b>Preço Inicial:</b> {{ $utils.formatCurrency(position.initialPrice) }}</p>
        <p style="margin-bottom: 1em">
          <b>Carteira:</b> {{ lastPortfolio.name }}
        </p>

        <b-field label="Nova Carteira">
          <b-select
            v-model="selectedPortfolio"
            placeholder="Carteira"
            expanded
          >
            <option
              v-for="option in portfolioData.portfolios"
              :key="option.id"
              :value="option.id"
            >
              {{ option.name }}
            </option>
          </b-select>
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
          Mover
        </button>
      </footer>
    </div>
  </form>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'MovePositionForm',
  props: {
    position: {
      type: Object,
      default: () => {}
    }
  },
  
  data() {
    return {
      selectedPortfolio: null
    }
  },

  computed: {
    ...mapState({ portfolioData: state => state.portfolios.portfolioData }),
    ...mapGetters({ lastPortfolio: 'lastPortfolio' })
  },
  
  methods: {
    // Triggers the "move-position" event to the parent component when the form is submitted,
    // with the position and the new portfolio as payload
    movePosition() {
      this.$parent.close()
      this.$emit('move-position', {
        portfolio: this.selectedPortfolio,
        position: this.position
      })
    }
  }
}
</script>
