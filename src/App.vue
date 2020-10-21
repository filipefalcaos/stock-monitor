<template>
  <router-view />
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapState({
      stats: state => state.portfolios.stats
    }),
    
    ...mapGetters({
      lastPortfolio: 'lastPortfolio',
      isEmpty: 'isEmpty'
    })
  },

  // Gets the last state of the portfolios and options data when the app is created
  created() {
    this.$store.commit('setDataFileName');
    this.$store.commit('loadDataFile');
    
    if (!this.isEmpty) {
      this.$store.commit('setCurrentPositions', this.lastPortfolio.positions);
      this.$store.commit('computeStats');
    }
  }
}
</script>

<style lang="scss">
  @import "~buefy/dist/buefy.css";
  @import 'assets/scss/style';
</style>
