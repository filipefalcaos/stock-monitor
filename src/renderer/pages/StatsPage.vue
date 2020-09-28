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
    <line-chart :labels="labels" :data="data" title="Resultados de Carteiras" />

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
import LineChart from "../charts/LineChart";

export default {
  name: "stats-page",
  components: { LineChart },
  
  data() {
    return {
      process: process,
      data: [600,	1150,	342,	6050,	2522,	3241,	1259,	157, 1545, 9841],
      labels: ["Babol",	"Cabanatuan",	"Daegu",	"Jerusalem",	"Fairfield",	"New York",	"Gangtok", "Buenos Aires", 
               "Hafar Al-Batin", "Idlib"]
    };
  }
}
</script>
