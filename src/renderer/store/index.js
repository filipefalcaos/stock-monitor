import Vue from 'vue'
import Vuex from 'vuex'

import portfolios from './modules/portfolios'
import stocks from './modules/stocks'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    portfolios,
    stocks
  }
});
