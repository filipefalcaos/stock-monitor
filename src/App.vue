<template>
  <div>
    <b-loading
      v-model="isLoading"
      :class="{ 'initial-loading': appCreated }"
    />
    <router-view />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'App',

  computed: {
    ...mapState({
      appCreated: state => state.appCreated,
      isLoading: state => state.isLoading
    })
  },

  // Gets the last state of the portfolios and options data when the app is created
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

  .initial-loading {
    background-color: rgba(255, 255, 255, 1)
  }
</style>
