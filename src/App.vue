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
      lastPortfolio: 'lastPortfolio'
    })
  },

  // Gets the last state of the portfolios and options data when the app is created
  created() {
    this.$store.commit('setDataFileName');
    this.$store.commit('loadDataFile');
    this.$store.commit('setCurrentPositions', this.lastPortfolio.positions);
    this.$store.commit('computeStats');
  }
}
</script>

<style lang="scss">
  @import "~buefy/dist/buefy.css";
  @import 'assets/scss/style';
  @import url("https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css");
</style>
