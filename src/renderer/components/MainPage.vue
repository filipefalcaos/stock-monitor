<!-- Template -->
<template>
  <section class="section">
    <div class="columns">
      <div class="column is-four-fifths">
        <h1 class="title title-text">
          Compras
        </h1>
        
        <!-- Table of the stocks where the bet was on going up -->
        <stock-table :stock-data="stock_data_buy" :is-processing="is_processing" :new-data="new_data"></stock-table>
      </div>

      <!-- Overall stats -->
      <div class="column" style="margin-top: 3.15rem; margin-left: 1.5rem;">
        <h1 class="title base-text" style="margin-bottom: 0.5rem;">
          Valor Feito = R$ {{ full_value.toFixed(2) }}
        </h1>
        <h1 class="title base-text" style="margin-bottom: 0.5rem;">
          Resultado = R$ {{ final_result }} ({{ percent_result.toFixed(2) }}%)
        </h1>

        <div class="buttons" style="margin-top: 2rem;">
          <b-button @click="get_stock_prices" :disabled="is_processing_aux" type="is-info" expanded>
            Atualizar
          </b-button>
          <b-button type="is-success" expanded>
            Salvar Excel
          </b-button>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-four-fifths">
        <h1 class="title title-text">
          Vendas
        </h1>
        
        <!-- Table of the stocks where the bet was on going down -->
        <stock-table :stock-data="stock_data_sell" :is-processing="is_processing" :new-data="new_data"></stock-table>
      </div>
    </div>
  </section>
</template>

<!-- Script -->
<script>
  import StockTable from './StockTable'

  export default {
    name: 'main-page',
    components: { StockTable },
    
    // Gets the current state of the stocks when the component is created
    created() {
      this.get_stock_prices();
    },

    computed: {

      // Returns the stocks where the bet was on going up
      stock_data_buy() {
        return this.stock_data.filter(stock => { return stock.buy });
      },

      // Returns the stocks where the bet was on going down
      stock_data_sell() {
        return this.stock_data.filter(stock => { return !stock.buy });
      }

    },
    
    data() {
      return {
        new_data: false,
        is_processing: false,
        has_error: false,
        full_value: 100000,
        final_result: 3055.6,
        percent_result: 3.06,
        stock_data: [
          { 'stock': 'AZUL4', 'uol_code': 1881, 'first_price': 16.96, 'amount': 600, 'buy': true },
          { 'stock': 'RAPT4', 'uol_code': 522, 'first_price': 6.08, 'amount': 1700, 'buy': true },
          { 'stock': 'IRBR3', 'uol_code': 1914, 'first_price': 10.66, 'amount': 1000, 'buy': true },
          { 'stock': 'CEAB3', 'uol_code': 2395, 'first_price': 7.82, 'amount': 1300, 'buy': true },
          { 'stock': 'UGPA3', 'uol_code': 674, 'first_price': 13.58, 'amount': 700, 'buy': true },
          { 'stock': 'VIVA3', 'uol_code': 2388, 'first_price': 15.55, 'amount': 700, 'buy': true },
          { 'stock': 'ALSO3', 'uol_code': 2329, 'first_price': 26.71, 'amount': 400, 'buy': true },
          { 'stock': 'LINX3', 'uol_code': 1404, 'first_price': 20.29, 'amount': 500, 'buy': true },
          { 'stock': 'MRVE3', 'uol_code': 451, 'first_price': 13.12, 'amount': 700, 'buy': true },
          { 'stock': 'YDUQ3', 'uol_code': 2324, 'first_price': 26.10, 'amount': 400, 'buy': true },
          { 'stock': 'BOVA11', 'uol_code': 1027, 'first_price': 75.75, 'amount': 1340, 'buy': false }
        ]
      }
    },
    
    methods: {

      // Gets the price of all stocks listed on "stock_data" and updates the UI
      // data accordingly
      get_stock_prices() {
        let promises = [];
        let base_url = 'http://cotacoes.economia.uol.com.br/ws/asset/';
        this.is_processing_aux = true;
        this.has_error = false;
        
        // Only sets processing state if not in error state - waits 500ms
        setTimeout(() => {
          if (this.is_processing_aux && !this.has_error) this.is_processing = true; 
        }, 500);

        // Gets the most recent price of each stock
        this.stock_data.forEach(stock => {
          promises.push(
            this.$http.get(base_url + stock.uol_code + '/intraday?size=1').then(response => {
              stock.aux_price = response.data.data[0].price;
              stock.aux_var = response.data.data[0].var;
              stock.aux_varpct = response.data.data[0].varpct;
            })
          );
        });

        // After all prices are collected, update the UI
        Promise.all(promises).then(() => {
          this.stock_data.forEach(stock => {
            stock.current_price = stock.aux_price;
            stock.var = stock.aux_var;
            stock.varpct = stock.aux_varpct;
          });

          this.update_stock_prices();
          this.new_data = true;
          setTimeout(() => { this.new_data = false; }, 2000);
        }).catch(error => {
          this.has_error = true;
          if (this.is_processing) {
            this.is_processing = false;
            this.is_processing_aux = false; 
          }

          // Display an error message
          const notification = this.$buefy.notification.open({
              duration: 5000,
              message: 'Falha ao se conectar ao servidor. Por favor, cheque sua conexão.',
              position: 'is-bottom-right',
              type: 'is-danger',
              queue: false
          });
        });
      },

      // Updates the stock prices and the result data on the UI
      update_stock_prices() {
        let sum = 0;

        this.stock_data.forEach(stock => {
          if (stock.buy) stock.result = ((stock.current_price - stock.first_price) * stock.amount).toFixed(2);
          else stock.result = ((stock.first_price - stock.current_price) * stock.amount).toFixed(2);
          sum += parseFloat(stock.result);
        });

        this.final_result = parseFloat(sum).toFixed(2);
        this.percent_result = (sum / this.full_value) * 100;
        this.is_processing = this.is_processing_aux = false;
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
    padding: 20px!important;
  }

  .title-text {
    font-size: 18px!important;
  }

  .base-text {
    font-size: 14px!important;
  }

  .green-success {
    color: hsl(141, 53%, 53%)
  }
</style>
