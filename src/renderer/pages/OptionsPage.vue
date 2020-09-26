<!-- Template -->
<template>
  <section :class="process.platform === 'win32' ? 'section-win' : 'section'">
    <nav class="level" style="margin-bottom: 12px;">
      <div class="level-left">
        <div class="level-item">
          <b-button @click="$emit('toggle-menu')" type="is-light" icon-left="menu">Menu</b-button>
        </div>
      </div>
    </nav>
  </section>
</template>

<!-- Script -->
<script>
export default {
  name: "options-page",
  data() {
    return {
      process: process
    };
  },
}
</script>
