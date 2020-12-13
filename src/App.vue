<template>
  <div>
    <b-loading v-model="isLoading" />
    <router-view />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapState({ isLoading: state => state.isLoading }),
    ...mapGetters({
      lastPortfolio: 'lastPortfolio',
      isEmpty: 'isEmpty'
    })
  },

  // Gets the last state of the portfolios and options data when the app is created
  created() {
    this.$store.commit('setDataFileName')
    this.$store.commit('loadDataFile')
    if (!this.isEmpty) this.$store.commit('setCurrentPositions', this.lastPortfolio.positions)
  }
}
</script>

<style lang="scss">
  @import "~buefy/dist/buefy.css";
  @import 'assets/scss/style';
  @import url('https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css');
</style>
