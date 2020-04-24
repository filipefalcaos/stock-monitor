<!-- Template -->
<template>
  <form action>
    <div class="modal-card" style="width: 450px;">
      <header class="modal-card-head">
        <p class="modal-card-title">Nova Ação</p>
      </header>

      <section class="modal-card-body">
        <b-field label="Ação">
          <b-input :value="stock" placeholder="PETR4" required></b-input>
        </b-field>

        <b-field label="Quantidade">
          <b-input :value="amount" placeholder="100" required></b-input>
        </b-field>

        <b-field label="Preço Comprado">
          <b-input :value="firstPrice" placeholder="20,00" required></b-input>
        </b-field>

        <h1>
          <b>Posição:</b>
          <span v-if="isBuying">Comprado</span>
          <span v-else>Vendido</span>
        </h1>
      </section>

      <footer class="modal-card-foot">
        <button class="button" type="button" @click="$parent.close()">Cancelar</button>
        <button class="button is-info">Adicionar</button>
      </footer>
    </div>
  </form>
</template>

<!-- Script -->
<script>
export default {
  name: "stock-form",
  props: ["stock", "amount", "firstPrice", "isBuying"]
};
</script>
