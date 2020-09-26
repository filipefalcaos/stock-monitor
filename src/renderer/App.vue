<!-- Entry template -->
<template>
  <div id="app">
    <b-sidebar type="is-light" fullheight overlay :open.sync="open">
      <div class="p-1">
        <img src="./assets/imgs/logo.png" alt="Stock monitoring for B3" :to="{ path: '/' }" />

        <!-- The app's menu -->
        <b-menu style="margin-top: 2rem;">
          <b-menu-list label="Menu">
            <b-menu-item icon="poll-box" label="Desempenho" @click="toStats" />
            <b-menu-item icon="finance" label="Carteiras" @click="toPortfolios" />
            <b-menu-item icon="currency-usd" label="Opções" @click="toOptions" />
          </b-menu-list>

          <b-menu-list label="Ações">
            <b-menu-item icon="exit-to-app" label="Logout" />
          </b-menu-list>
        </b-menu>
      </div>
    </b-sidebar>

    <!-- The app's view -->
    <router-view v-on:toggle-menu="open = open ? false : true" />
  </div>
</template>

<!-- Entry script -->
<script>
export default {
  name: "stock-monitor",
  data() {
    return {
      open: false
    };
  },

  methods: {
    toPortfolios() {
      this.$router.push({ name: 'portfolios' });
    },

    toOptions() {
      this.$router.push({ name: 'options' });
    },

    toStats() {
      this.$router.push({ name: 'stats' });
    }
  }
};
</script>

<!-- App styles -->
<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");
@import url("https://cdn.materialdesignicons.com/2.5.94/css/materialdesignicons.min.css");
@import "~bulma/sass/utilities/_all";

// Set new colors
$primary: #2a9fd6;
$primary-invert: findColorInvert($primary);
$info: #2984d3;
$info-invert: findColorInvert($info);
$link: #2984d3;
$link-invert: findColorInvert($link);
$success: #3fbf61;
$success-invert: findColorInvert($success);
$warning: #fed746;
$warning-invert: findColorInvert($warning);
$danger: #ea2b55;
$danger-invert: findColorInvert($danger);

// Setup $colors to use as bulma classes
$colors: (
  "white": (
    $white,
    $black
  ),
  "black": (
    $black,
    $white
  ),
  "light": (
    $light,
    $light-invert
  ),
  "dark": (
    $dark,
    $dark-invert
  ),
  "primary": (
    $primary,
    $primary-invert
  ),
  "info": (
    $info,
    $info-invert
  ),
  "link": (
    $link,
    $link-invert
  ),
  "success": (
    $success,
    $success-invert
  ),
  "warning": (
    $warning,
    $warning-invert
  ),
  "danger": (
    $danger,
    $danger-invert
  )
);

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: "Source Sans Pro", sans-serif;
  // background-color: rgb(40, 56, 75);
}

.p-1 {
  padding: 1em;
}

.active-menu {
  background-color: #2984d3;
  color: #ffffff;
}

.modal-border-top {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.section {
  padding: 2rem !important;
  width: 100%;
}

.section-win {
  padding: 20px !important;
  width: 100%;
}

.title-text {
  font-size: 20px !important;
  // color: #FFFFFF;
}

.title-text-win {
  font-size: 18px !important;
  // color: #FFFFFF;
}

.base-text {
  font-size: 16px !important;
  font-weight: 500 !important;
  // color: #FFFFFF;
}

.base-text-win {
  font-size: 14px !important;
  font-weight: 500 !important;
  // color: #FFFFFF;
}

.green-success {
  color: $success;
}
</style>
