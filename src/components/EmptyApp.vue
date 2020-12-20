<template>
  <div
    style="min-height: 85vh; display: flex;"
    class="flex-row align-items-center"
  >
    <CContainer>
      <CRow class="justify-content-center">
        <CCol
          lg="6"
          class="text-center"
        >
          <figure style="margin-bottom: 1.5rem;">
            <img
              width="150px"
              src="../assets/img/stock-market.png"
            >
          </figure>

          <h5 style="margin-bottom: 1.5rem;">
            Ainda não há carteiras de ativos ou operações de opções cadastradas.
            Comece agora a acompanhar seus investimentos!
          </h5>

          <CButton
            color="success"
            @click="newPortfolio"
          >
            <CIcon name="cil-plus" />
            Nova Carteira
          </CButton>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
export default {
  name: 'EmptyApp',
  methods: {
    newPortfolio() {
      this.$buefy.dialog.prompt({
        message: 'Forneça um nome para a nova carteira.',
        inputAttrs: {
          placeholder: 'Nome da Carteira',
          maxlength: 30
        },
        confirmText: 'Adicionar',
        cancelText: 'Cancelar',
        trapFocus: true,
        type: 'is-info',
        onConfirm: value => {
          this.$store.commit('newPortfolio', value)
          this.$store.commit('updateDataFile')
          if (this.$route.name !== 'Carteiras') this.$router.push({ name: 'Carteiras' })
        }
      })
    }
  }
}
</script>
