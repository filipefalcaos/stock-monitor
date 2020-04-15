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

      <div class="column" style="margin-left: 1.5rem; margin-top: 0.3rem;">
        <b-select
          @input="load_portfolio"
          v-model="selected_portfolio"
          style="margin-bottom: 1.5rem;"
          placeholder="Selecione uma carteira"
          expanded
        >
          <option
            v-for="option in portfolio_data.portfolios"
            :value="option.id"
            :key="option.id"
          >{{ option.name }}</option>
        </b-select>

        <div class="buttons">
          <b-button @click="add_portfolio_dialog" type="is-success" expanded>Adicionar Carteira</b-button>

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
    this.get_portfolios_data();
    this.get_stock_prices();
    this.get_available_stocks();
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
      selected_portfolio: 1,
      portfolio_data: PortfolioData,
      portfolios: [],
      stock_data: [],
      available_stocks: []
    };
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

  methods: {
    update_selected_data(portfolio) {
      this.stock_data = portfolio.stocks;
      this.full_value = portfolio.investment;
    },

    get_portfolios_data() {
      this.selected_portfolio = this.portfolio_data.last_portfolio;

      // Gets the stocks from the last portfolio used
      let lastPortfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.selected_portfolio;
      });

      this.update_selected_data(lastPortfolio);
    },

    load_portfolio() {
      let newPotfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.selected_portfolio;
      });

      // Updates the stocks data
      this.update_selected_data(newPotfolio);
      this.get_stock_prices();
    },

    create_portfolio(portfolio_name) {
      let newId = this.portfolio_data.id_count + 1;
      let newPortfolio = {
        name: portfolio_name,
        id: newId,
        investment: 0,
        stocks: []
      };

      // Adds an empty portfolio with the given name
      this.portfolio_data.portfolios.push(newPortfolio);
      this.selected_portfolio = this.portfolio_data.last_portfolio = newId;
      this.update_selected_data(newPortfolio);
    },

    add_portfolio_dialog() {
      this.$buefy.dialog.prompt({
        message: "Insira um nome para a nova carteira.",
        inputAttrs: {
          placeholder: "Portfólio",
          maxlength: 30
        },
        confirmText: "Adicionar",
        cancelText: "Cancelar",
        trapFocus: true,
        type: "is-info",
        onConfirm: value => this.create_portfolio(value)
      });
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
          this.$buefy.notification.open({
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
    },

    get_available_stocks() {
      let base_url = "http://cotacoes.economia.uol.com.br/ws/asset/";
      this.$http
        .get(base_url + "stock/list?size=10000")
        .then(response => {
          this.available_stocks = response.data.data;
        })
        .catch(error => {
          this.$buefy.notification.open({
            duration: 5000,
            message:
              "Não foi possível obter a lista de ações. Por favor, cheque sua conexão.",
            position: "is-bottom-right",
            type: "is-danger"
          });
        });
    }
  }
};
</script>
