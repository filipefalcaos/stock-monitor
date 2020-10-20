<template>
  <CHeader
    fixed
    with-subheader
    light
  >
    <CToggler
      in-header
      class="ml-3 d-lg-none"
      @click="$store.commit('toggleSidebarMobile')"
    />
    <CToggler
      in-header
      class="ml-3 d-md-down-none"
      @click="$store.commit('toggleSidebarDesktop')"
    />
    <CHeaderBrand
      class="mx-auto d-lg-none"
      to="/"
    >
      <CIcon
        name="logo"
        height="48"
        alt="Logo"
      />
    </CHeaderBrand>
    <CHeaderNav class="d-md-down-none mr-auto">
      <CHeaderNavItem class="px-3">
        {{ $route.name }}
      </CHeaderNavItem>
    </CHeaderNav>
    <CHeaderNav class="mr-4">
      <CHeaderNavItem class="d-md-down-none mx-2">
        <CHeaderNavLink>
          <CIcon name="cil-bell" />
        </CHeaderNavLink>
      </CHeaderNavItem>
      <CHeaderNavItem class="d-md-down-none mx-2">
        <CHeaderNavLink>
          <CIcon name="cil-account-logout" />
        </CHeaderNavLink>
      </CHeaderNavItem>
    </CHeaderNav>
  </CHeader>
</template>

<script>
export default {
  name: 'Header'
}
</script>
