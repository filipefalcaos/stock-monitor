import Vue from 'vue'
import Vuex from 'vuex'

import portfolios from './modules/portfolios'
import stats from './modules/stats'

// Root initial state
const state = () => ({
  isLoading: false,
  hasNewData: false,
  hasError: false,
  sidebarShow: 'responsive',
  sidebarMinimize: true,
  selPosition: null
})

// Root mutations
const mutations = {
  toggleSidebarDesktop(state) {
    const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarOpened ? false : 'responsive'
  },
  
  toggleSidebarMobile(state) {
    const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
    state.sidebarShow = sidebarClosed ? true : 'responsive'
  },
  
  set(state, [variable, value]) {
    state[variable] = value
  }
}

Vue.use(Vuex)
export default new Vuex.Store({
  state: state,
  mutations: mutations,
  modules: {
    portfolios,
    stats
  }
})
