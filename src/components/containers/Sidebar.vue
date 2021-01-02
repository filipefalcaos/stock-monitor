<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand to="/">
      <img
        style="height: 30px;"
        class="c-sidebar-brand-minimized"
        src="../../assets/img/logo-small.png"
        alt="stock-monitor logo"
      >
    </CSidebarBrand>

    <CRenderFunction
      flat
      :content-to-render="$options.nav"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'

export default {
  name: 'Sidebar',
  nav,
  computed: {
    show() { return this.$store.state.sidebarShow },
    minimize() { return this.$store.state.sidebarMinimize }
  }
}
</script>
