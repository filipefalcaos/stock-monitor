<template>
  <div>
    <b-loading v-model="isLoading" />
    <router-view />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapState({ isLoading: state => state.isLoading })
  },

  // Gets the last state of the portfolios and options data when the app is created
  created() {
    this.$store.commit('setDataFileName')
    this.$store.commit('loadDataFile')
  }
}
</script>

<style lang="scss">
  @import "~buefy/dist/buefy.css";
  @import 'assets/scss/style';
  @import url('https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css');
</style>
