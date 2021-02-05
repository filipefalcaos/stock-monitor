<template>
  <transition name="fade">
    <div
      v-if="active"
      class="overlay"
    >
      <div class="overlay-background" />
      <spinner
        size="big"
        line-fg-color="#ced2d8"
        :speed="1"
      />
    </div>
  </transition>
</template>

<script>
import Spinner from 'vue-simple-spinner'

export default {
  name: 'SpinnerOverlay',
  components: { Spinner },
  props: {
    active: {
      type: Boolean,
      default: true
    }
  },

  watch: {
    active: function(val) {
      if (val) {
        document.body.classList.add('overlay-shown')
        document.documentElement.classList.add('overlay-shown')
      } else {
        document.body.classList.remove('overlay-shown')
        document.documentElement.classList.remove('overlay-shown')
      }
    }
  }
}
</script>

<style lang="scss">
  .overlay {
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    align-items: center;
    display: flex;
    justify-content: center;
    overflow: hidden;
    z-index: 5;
  }

  .overlay-background {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    background: #fff;
    opacity: 0.5;
  }

  .overlay-shown {
    overflow: hidden;
  }
</style>
