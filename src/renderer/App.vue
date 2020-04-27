<!-- Entry template -->
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<!-- Entry script -->
<script>
export default {
  name: "stock-monitor"
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
$info: #2984D3;
$info-invert: findColorInvert($info);
$link: #3273e2;
$link-invert: findColorInvert($link);
$success: #3FBF61;
$success-invert: findColorInvert($success);
$warning: #FED746;
$warning-invert: findColorInvert($warning);
$danger: #EA2B55;
$danger-invert: findColorInvert($danger);

// Setup $colors to use as bulma classes
$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($light, $light-invert),
    "dark": ($dark, $dark-invert),
    "primary": ($primary, $primary-invert),
    "info": ($info, $info-invert),
    "link": ($link, $link-invert),
    "success": ($success, $success-invert),
    "warning": ($warning, $warning-invert),
    "danger": ($danger, $danger-invert)
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
  background-color: rgb(40, 56, 75);
}

.section {
  padding: 2rem !important;
}

.section-win {
  padding: 20px !important;
}

.title-text {
  font-size: 24px !important;
  color: #FFFFFF;
}

.title-text-win {
  font-size: 18px !important;
  color: #FFFFFF;
}

.base-text {
  font-size: 16px !important;
  font-weight: 500 !important;
  color: #FFFFFF;
}

.base-text-win {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #FFFFFF;
}

.green-success {
  color: $success;
}
</style>
