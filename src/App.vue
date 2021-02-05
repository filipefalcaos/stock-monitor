<template>
  <div>
    <spinner-overlay :active="isLoading" />
    <router-view />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SpinnerOverlay from './components/containers/SpinnerOverlay'

export default {
  name: 'App',
  components: { SpinnerOverlay },

  computed: {
    ...mapState({
      appCreated: state => state.appCreated,
      isLoading: state => state.isLoading
    })
  },

  // Loads the portfolios data file when the component is created
  created() {
    this.$store.commit('set', ['appCreated', true])
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
