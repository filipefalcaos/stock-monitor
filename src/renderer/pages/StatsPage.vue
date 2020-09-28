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

    <nav class="level" style="margin-top: 1.7rem;">
      <div class="level-left">
        <div class="level-item" style="margin-right: 0;">
          <h1
            class="title"
            :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
          >Resultados: Carteiras</h1>
        </div>
      </div>
    </nav>

    <!-- Chart of Portfolio Results -->
    <line-chart :labels="stats.currentDates" :data="stats.currentResults" title="Resultados de Carteiras" />

    <nav class="level" style="margin-top: 1.7rem;">
      <div class="level-left">
        <div class="level-item" style="margin-right: 0;">
          <h1
            class="title"
            :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
          >Resultados: Operações em Opções</h1>
        </div>
      </div>
    </nav>
  </section>
</template>

<!-- Script -->
<script>
import { mapGetters, mapState } from "vuex";
import LineChart from "../charts/LineChart";

export default {
  name: "stats-page",
  components: { LineChart },

  // Gets the last state of the portfolio and options data when the component 
  // is created. Also, gets the current state of the positions
  created() {
    this.$store.commit("setDataFileName");
    this.$store.commit("loadDataFile");
    this.$store.commit("setCurrentPositions", this.lastPortfolio.positions);
    this.$store.commit("computeStats");
  },
  
  data() {
    return {
      process: process
    };
  },

  computed: {
    ...mapState({
      stats: state => state.portfolios.stats
    }),

    ...mapGetters({
      lastPortfolio: "lastPortfolio"
    })
  },
}
</script>
