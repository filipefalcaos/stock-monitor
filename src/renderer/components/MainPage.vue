<!-- Template -->
<template>
  <section class="section" :class="process.platform === 'win32' ? 'section-win' : 'section'">
    <div class="columns">
      <div class="column is-full">
        <h1
          class="title"
          :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
        >Posição: Comprado</h1>
      </div>
    </div>

    <div class="columns">
      <div class="column is-four-fifths">
        <stock-table :stock-data="stock_data_buy" :new-data="new_data"></stock-table>
      </div>

      <div class="column" style="margin-left: 1.5rem;">
        <div class="buttons" style="margin-top: 0.3rem;">
          <b-button
            @click="get_stock_prices"
            :loading="is_processing"
            type="is-info"
            expanded
          >Atualizar</b-button>
        </div>

        <h1
          class="title"
          :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
          style="margin-bottom: 0.5rem;"
        >
          <b>Valor Feito:</b>
          R$ {{ full_value.toFixed(2) }}
        </h1>

        <h1
          class="title"
          :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
          style="margin-bottom: 0.5rem;"
        >
          <b v-if="has_error" style="text-align: justify; ">Resultados indisponíveis.</b>
          <span v-else>
            <b>Resultado:</b>
            R$ {{ final_result }} ({{ percent_result.toFixed(2) }}%)
          </span>
        </h1>
      </div>
    </div>

    <div class="columns">
      <div class="column is-full">
        <h1
          class="title title-text"
          :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
        >Posição: Vendido</h1>
      </div>
    </div>

    <div class="columns">
      <div class="column is-four-fifths">
        <stock-table :stock-data="stock_data_sell" :new-data="new_data"></stock-table>
      </div>
    </div>
  </section>
</template>

<!-- Script -->
<script>
import StockTable from "./StockTable";
import PortfolioData from "../assets/portfolio-data.json";

export default {
  name: "main-page",
  components: { StockTable },

  // Gets the last state of the portfolio data. Also, gets the current state
  // of the stocks when the component is created
  created() {
    this.get_portfolio_data();
    this.get_stock_prices();
  },

  computed: {
    stock_data_buy() {
      return this.stock_data.filter(stock => {
        return stock.buy;
      });
    },

    stock_data_sell() {
      return this.stock_data.filter(stock => {
        return !stock.buy;
      });
    }
  },

  data() {
    return {
      process: process,
      new_data: false,
      is_processing: false,
      has_error: false,
      full_value: 0,
      final_result: 0,
      percent_result: 0,
      stock_data: []
    };
  },

  methods: {
    get_portfolio_data() {
      let lastPortfolio = PortfolioData.portfolios.find(
        portfolio => portfolio.id == PortfolioData.last_portfolio
      );
      this.stock_data = lastPortfolio.stocks;
      this.full_value = lastPortfolio.investment;
    },

    get_stock_prices() {
      let promises = [];
      let base_url = "http://cotacoes.economia.uol.com.br/ws/asset/";
      this.is_processing = true;
      this.has_error = false;

      // Gets the most recent price of each stock
      this.stock_data.forEach(stock => {
        promises.push(
          this.$http
            .get(base_url + stock.uol_code + "/intraday?size=1")
            .then(response => {
              stock.aux_price = response.data.data[0].price;
              stock.aux_var = response.data.data[0].var;
              stock.aux_varpct = response.data.data[0].varpct;
            })
        );
      });

      // After all prices are collected, update the UI
      Promise.all(promises)
        .then(() => {
          this.stock_data.forEach(stock => {
            stock.current_price = stock.aux_price;
            stock.var = stock.aux_var;
            stock.varpct = stock.aux_varpct;
          });

          this.update_stock_prices();
          this.new_data = true;
          this.is_processing = false;
          setTimeout(() => {
            this.new_data = false;
          }, 2000);
        })
        .catch(error => {
          this.has_error = true;
          if (this.is_processing) this.is_processing = false;

          // Display an error message
          const notification = this.$buefy.notification.open({
            duration: 5000,
            message:
              "Falha ao se conectar ao servidor. Por favor, cheque sua conexão.",
            position: "is-bottom-right",
            type: "is-danger"
          });
        });
    },

    update_stock_prices() {
      let sum = 0;

      this.stock_data.forEach(stock => {
        if (stock.buy) {
          stock.result = (
            (stock.current_price - stock.first_price) *
            stock.amount
          ).toFixed(2);
        } else {
          stock.result = (
            (stock.first_price - stock.current_price) *
            stock.amount
          ).toFixed(2);
        }

        sum += parseFloat(stock.result);
      });

      this.final_result = parseFloat(sum).toFixed(2);
      this.percent_result = (sum / this.full_value) * 100;
    }
  }
};
</script>
