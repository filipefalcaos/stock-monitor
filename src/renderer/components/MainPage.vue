<!-- Template -->
<template>
  <section class="section">
    <div class="columns">
      <div class="column is-two-thirds">
        <h1 class="title is-4">Compras</h1>
        <b-table :data="stock_data_buy" :striped="true" :hoverable="true" :mobile-cards="true">
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
            <b-table-column :class="{ 'green-success': new_data }" field="current_price" label="Preço Atual" :numeric="true">
              R$ {{ props.row.current_price }}
            </b-table-column>
            <b-table-column field="result" label="Resultado" :numeric="true">
              R$ {{ props.row.result }}
              <span v-if="props.row.result > 0">😀</span>
              <span v-else-if="props.row.result == 0">😐</span>
              <span v-else>😢</span>
            </b-table-column>
          </template>
        </b-table>
      </div>

      <div class="column" style="margin-top: 3.75rem; margin-left: 1.5rem;">
        <h1 class="title is-5" style="margin-bottom: 0.5rem;">Valor Feito = R$ {{ full_value.toFixed(2) }} </h1>
        <h1 class="title is-5" style="margin-bottom: 0.5rem;">Resultado Total = R$ {{ final_result }} </h1>
        <h1 class="title is-5">Resultado Percentual = {{ percent_result.toFixed(2) }}% </h1>

        <div class="buttons">
          <b-button @click="get_stock_prices" type="is-info" expanded>Atualizar</b-button>
          <b-button type="is-success" expanded>Salvar Excel</b-button>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-two-thirds">
        <h1 class="title is-4">Vendas</h1>
        <b-table :data="stock_data_sell" :striped="true" :hoverable="true" :mobile-cards="true">
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
            <b-table-column :class="{ 'green-success': new_data }" field="current_price" label="Preço Atual" :numeric="true">
              R$ {{ props.row.current_price }}
            </b-table-column>
            <b-table-column field="result" label="Resultado" :numeric="true">
              R$ {{ props.row.result }}
              <span v-if="props.row.result > 0">😀</span>
              <span v-else-if="props.row.result == 0">😐</span>
              <span v-else>😢</span>
            </b-table-column>
          </template>
        </b-table>
      </div>
    </div>
  </section>
</template>

<!-- Script -->
<script>
  export default {
    name: 'landing-page',
    
    created () {
      this.get_stock_prices();
      this.update_stock_prices();
    },
    
    data() {
      return {
        new_data: false,
        full_value: 100000,
        final_result: 3055.6,
        percent_result: 3.06,
        stock_data_buy: [
          { 'stock': 'AZUL4', 'uol_code': 1881, 'first_price': 16.96, 'amount': 600, 'current_price': 15.99 },
          { 'stock': 'RAPT4', 'uol_code': 522, 'first_price': 6.08, 'amount': 1700, 'current_price': 6.35 },
          { 'stock': 'IRBR3', 'uol_code': 1914, 'first_price': 10.66, 'amount': 1000, 'current_price': 10.68 },
          { 'stock': 'CEAB3', 'uol_code': 2395, 'first_price': 7.82, 'amount': 1300, 'current_price': 8.26 },
          { 'stock': 'UGPA3', 'uol_code': 674, 'first_price': 13.58, 'amount': 700, 'current_price': 13.18 },
          { 'stock': 'VIVA3', 'uol_code': 2388, 'first_price': 15.55, 'amount': 700, 'current_price': 15.49 },
          { 'stock': 'ALSO3', 'uol_code': 2329, 'first_price': 26.71, 'amount': 400, 'current_price': 26.42 },
          { 'stock': 'LINX3', 'uol_code': 1404, 'first_price': 20.29, 'amount': 500, 'current_price': 20.29 },
          { 'stock': 'MRVE3', 'uol_code': 451, 'first_price': 13.12, 'amount': 700, 'current_price': 12.69 },
          { 'stock': 'YDUQ3', 'uol_code': 2324, 'first_price': 26.10, 'amount': 400, 'current_price': 26.91 }
        ],
        stock_data_sell: [
          { 'stock': 'BOVA11', 'uol_code': 1027, 'first_price': 75.75, 'amount': 1340, 'current_price': 73.51 }
        ]
      }
    },
    
    methods: {
      get_stock_prices() {
        this.stock_data_buy.forEach(stock => {
          this.$http
            .get('http://cotacoes.economia.uol.com.br/ws/asset/' + stock.uol_code + '/intraday?size=1')
            .then(response => {
              stock.current_price = response.data.data[0].price;
            });
        });

        this.stock_data_sell.forEach(stock => {
          this.$http
            .get('http://cotacoes.economia.uol.com.br/ws/asset/' + stock.uol_code + '/intraday?size=1')
            .then(response => {
              stock.current_price = response.data.data[0].price;
              this.update_stock_prices();
              this.new_data = true;
              setTimeout(() => { this.new_data = false; }, 2000);
            });
        });
      },

      update_stock_prices() {
        let sum = 0;

        this.stock_data_buy.forEach(stock => {
          stock.result = ((stock.current_price - stock.first_price) * stock.amount).toFixed(2);
          sum += parseFloat(stock.result);
        });

        this.stock_data_sell.forEach(stock => {
          stock.result = ((stock.first_price - stock.current_price) * stock.amount).toFixed(2);
          sum += parseFloat(stock.result);
        });

        this.final_result = parseFloat(sum).toFixed(2);
        this.percent_result = (sum / this.full_value) * 100;
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

  .section {
    padding: 2rem 2rem!important;
  }

  .green-success {
    color: hsl(141, 53%, 53%)
  }
</style>
