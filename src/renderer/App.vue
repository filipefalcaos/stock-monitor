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
<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

.section {
  padding: 2rem !important;
}

.section-win {
  padding: 20px !important;
}

.title-text {
  font-size: 24px !important;
}

.title-text-win {
  font-size: 18px !important;
}

.base-text {
  font-size: 16px !important;
  font-weight: 500 !important;
}

.base-text-win {
  font-size: 14px !important;
  font-weight: 500 !important;
}

.green-success {
  color: hsl(141, 53%, 53%);
}
</style>
