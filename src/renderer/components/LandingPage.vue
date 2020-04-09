<!-- Template -->
<template>
  <div id="wrapper">
    <b-table :data="stock_data" :striped="true" :hoverable="true" :mobile-cards="true">
      <template slot-scope="props">
        <b-table-column field="stock" label="Ação">
          {{ props.row.stock }}
        </b-table-column>
        <b-table-column field="first_price" label="Preço Comprado" :numeric="true">
          R$ {{ props.row.first_price }}
        </b-table-column>
        <b-table-column field="amount" label="Quantidade" :numeric="true">
          {{ props.row.amount }}
        </b-table-column>
        <b-table-column field="current_price" label="Preço Atual" :numeric="true">
          R$ {{ props.row.current_price }}
        </b-table-column>
        <b-table-column field="result" label="Resultado" :numeric="true">
          R$ {{ props.row.result }}
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>

<!-- Script -->
<script>
  export default {
    name: 'landing-page',
    created () {
      this.stock_data.forEach(stock => {
        stock.result = ((stock.current_price - stock.first_price) * stock.amount).toFixed(2)
      })
    },
    data () {
      return {
        stock_data: [
          { 'stock': 'AZUL4', 'first_price': 16.96, 'amount': 600, 'current_price': 15.99 },
          { 'stock': 'RAPT4', 'first_price': 6.08, 'amount': 1700, 'current_price': 6.35 },
          { 'stock': 'IRBR3', 'first_price': 10.66, 'amount': 1000, 'current_price': 10.68 },
          { 'stock': 'CEAB3', 'first_price': 7.82, 'amount': 1300, 'current_price': 8.26 },
          { 'stock': 'UGPA3', 'first_price': 13.58, 'amount': 700, 'current_price': 13.18 },
          { 'stock': 'VIVA3', 'first_price': 15.55, 'amount': 700, 'current_price': 15.49 },
          { 'stock': 'ALSO3', 'first_price': 26.71, 'amount': 400, 'current_price': 26.42 },
          { 'stock': 'LINX3', 'first_price': 20.29, 'amount': 500, 'current_price': 20.29 },
          { 'stock': 'MRVE3', 'first_price': 13.12, 'amount': 700, 'current_price': 12.69 },
          { 'stock': 'YDUQ3', 'first_price': 26.10, 'amount': 400, 'current_price': 26.91 }
        ]
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<!-- Styles -->
<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 40px 60px;
    width: 100vw;
  }
</style>
