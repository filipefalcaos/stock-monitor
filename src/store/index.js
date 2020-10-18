import Vue from 'vue'
import Vuex from 'vuex'

import portfolios from './modules/portfolios'
import containers from './modules/containers'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    portfolios,
    containers
  }
})
