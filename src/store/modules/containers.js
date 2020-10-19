// Initial state
const state = () => ({
  sidebarShow: 'responsive',
  sidebarMinimize: true
})

// Getters
const getters = {}

// Actions
const actions = {}

// Mutations
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

export default {
  state,
  getters,
  actions,
  mutations
}
