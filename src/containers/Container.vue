<template>
  <div class="c-app">
    <Sidebar />
    <CWrapper>
      <Header />
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid>
            <transition
              name="fade"
              mode="out-in"
            >
              <router-view :key="$route.path" />
            </transition>
          </CContainer>
        </main>
      </div>
    </CWrapper>
  </div>
</template>

<script>
import Sidebar from './Sidebar'
import Header from './Header'

export default {
  name: 'Container',
  components: {
    Sidebar,
    Header
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
