<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand
      to="/"
    >
      <!-- <CIcon 
        class="c-sidebar-brand-full" 
        name="logo" 
        size="custom-size" 
        :height="35" 
        view-box="0 0 556 134"
      />
      <CIcon 
        class="c-sidebar-brand-minimized" 
        name="logo" 
        size="custom-size" 
        :height="35" 
        view-box="0 0 110 134"
      /> -->
      <img
        height="40px"
        class="c-sidebar-brand-minimized"
        src="../assets/logo.png"
        alt="stock-monitor logo"
      >
      <img
        height="80px"
        style="margin: 10px"
        class="c-sidebar-brand-full"
        src="../assets/logo-big.png"
        alt="stock-monitor logo"
      >
    </CSidebarBrand>

    <CRenderFunction
      flat
      :content-to-render="$options.nav"
    />
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'

export default {
  name: 'Sidebar',
  nav,
  computed: {
    show() {
      return this.$store.state.containers.sidebarShow 
    },
    minimize() {
      return this.$store.state.containers.sidebarMinimize 
    }
  }
}
</script>
