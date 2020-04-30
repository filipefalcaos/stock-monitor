<!-- Template -->
<template>
  <section class="section" :class="process.platform === 'win32' ? 'section-win' : 'section'">
    <div class="columns is-vcentered">
      <div class="column is-2">
        <b-select
          @input="load_portfolio"
          v-model="portfolio_data.last_portfolio"
          placeholder="Carteira"
          expanded
        >
          <option
            v-for="option in portfolio_data.portfolios"
            :value="option.id"
            :key="option.id"
          >{{ option.name }}</option>
        </b-select>
      </div>

      <div class="column is-4">
        <div class="buttons">
          <b-button @click="add_portfolio_dialog" icon-left="plus" type="is-success">Carteira</b-button>
          <b-button
            @click="get_stock_prices"
            :loading="is_processing"
            icon-left="sync"
            type="is-info"
          >Atualizar</b-button>
        </div>
      </div>

      <div class="column">
        <h1
          class="title"
          :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
          style="float: right;"
        >
          <b>Total:</b>
          <span style="margin-right: 0.5rem;">{{ format_currency(full_value) }}</span>
          <span>|</span>

          <b style="margin-left: 0.5rem;">Ativo:</b>
          <span style="margin-right: 0.5rem;">{{ format_currency(active_value) }}</span>
          <span>|</span>

          <b
            v-if="has_error"
            style="margin-left: 0.5rem; text-align: justify; "
          >Resultados indisponíveis</b>
          <span v-else>
            <b style="margin-left: 0.5rem;">Resultado:</b>
            {{ format_currency(final_result) }} ({{ format_percent(percent_result) }})
          </span>
        </h1>
      </div>
    </div>

    <div class="columns is-vcentered" style="margin-top: 1rem;">
      <div class="column is-10">
        <h1
          class="title"
          :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
        >Em aberto</h1>
      </div>

      <div class="column is-2">
        <b-button
          @click="add_stock_dialog"
          style="float: right;"
          type="is-info"
          icon-left="plus"
        >Ação</b-button>
      </div>
    </div>

    <div class="columns">
      <div class="column is-full">
        <stock-table
          v-on:close-stocks="close_stocks"
          v-on:delete-stocks="delete_stocks"
          :stock-data="open_stocks"
          :has-new-data="has_new_data"
        />
      </div>
    </div>

    <div class="columns is-vcentered" style="margin-top: 1rem;">
      <div class="column is-full">
        <h1
          class="title"
          :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
        >Encerradas</h1>
      </div>
    </div>

    <div class="columns">
      <div class="column is-full">
        <stock-table
          v-on:close-stocks="close_stocks"
          v-on:delete-stocks="delete_stocks"
          :stock-data="closed_stocks"
          :has-new-data="has_new_data"
        />
      </div>
    </div>

    <b-modal
      :active.sync="is_processing_stock"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <stock-form v-on:submit-stock="add_stock" :stocks="available_stocks" />
    </b-modal>
  </section>
</template>

<!-- Script -->
<script>
import { remote } from "electron";
import { nanoid } from "nanoid";
import path from "path";
const fs = require("fs");

import StockTable from "./StockTable";
import StockForm from "./StockForm";

export default {
  name: "main-page",
  components: { StockTable, StockForm },

  // Gets the last state of the portfolio data. Also, gets the current state
  // of the stocks when the component is created
  created() {
    const dataPath = "/portfolio-data.json";
    this.fileName = path.join(remote.app.getPath("userData"), dataPath);

    /* Loads the portfolio data file */
    try {
      if (fs.existsSync(this.fileName)) {
        this.portfolio_data = JSON.parse(fs.readFileSync(this.fileName));
      } else {
        this.portfolio_data = {
          last_portfolio: null,
          portfolios: []
        };
        fs.writeFileSync(this.fileName, JSON.stringify(this.portfolio_data));
      }
    } catch (error) {
      console.error(error);
    }

    // Starts the UI state
    this.get_portfolios_data();
    this.get_stock_prices();
    this.get_available_stocks();
  },

  data() {
    return {
      process: process,
      has_new_data: false,
      is_processing: false,
      is_processing_stock: false,
      has_error: false,
      full_value: 0,
      active_value: 0,
      final_result: 0,
      percent_result: 0,
      portfolio_data: {},
      stock_data: [],
      available_stocks: [],
      fileName: ""
    };
  },

  computed: {
    open_stocks() {
      return this.stock_data.filter(stock => !stock.closed);
    },

    closed_stocks() {
      return this.stock_data.filter(stock => stock.closed);
    }
  },

  methods: {
    format_currency(num) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    },

    format_percent(num) {
      return new Intl.NumberFormat("pt-BR", {
        style: "percent",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    },

    update_selected_data(portfolio) {
      let investment = 0;
      let inactiveInvestment = 0;

      portfolio.stocks.forEach(stock => {
        investment += stock.initial_price * stock.amount;
        if (stock.closed) inactiveInvestment += stock.initial_price * stock.amount;
      });

      this.stock_data = portfolio.stocks;
      this.full_value = investment;
      this.active_value = investment - inactiveInvestment;
    },

    get_portfolios_data() {
      let lastPortfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.portfolio_data.last_portfolio;
      });

      if (lastPortfolio) this.update_selected_data(lastPortfolio);
    },

    load_portfolio() {
      let newPotfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.portfolio_data.last_portfolio;
      });

      // Updates the portfolio data file and the stocks data
      fs.writeFileSync(this.fileName, JSON.stringify(this.portfolio_data, null, 2));
      this.update_selected_data(newPotfolio);
      this.get_stock_prices();
    },

    create_portfolio(portfolio_name) {
      let newPortfolio = {
        id: nanoid(),
        name: portfolio_name,
        stocks: []
      };

      // Adds an empty portfolio with the given name
      this.portfolio_data.portfolios.push(newPortfolio);
      this.portfolio_data.last_portfolio = newPortfolio.id;
      this.final_result = 0;
      this.percent_result = 0;

      // Updates the portfolio data file and the UI
      fs.writeFileSync(this.fileName, JSON.stringify(this.portfolio_data, null, 2));
      this.update_selected_data(newPortfolio);
    },

    add_portfolio_dialog() {
      this.$buefy.dialog.prompt({
        message: "Insira um nome para a nova carteira.",
        inputAttrs: {
          placeholder: "Carteira",
          maxlength: 30
        },
        confirmText: "Adicionar",
        cancelText: "Cancelar",
        trapFocus: true,
        type: "is-info",
        onConfirm: value => this.create_portfolio(value)
      });
    },

    add_stock(new_stock) {
      let lastPortfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.portfolio_data.last_portfolio;
      });

      let newStock = {
        id: nanoid(),
        stock: new_stock.stock.code,
        uol_code: new_stock.stock.idt,
        initial_price: new_stock.initial_price,
        amount: new_stock.amount,
        position: new_stock.position,
        closed: false
      };

      // Updates the portfolio data file and the UI
      lastPortfolio.stocks.push(newStock);
      fs.writeFileSync(this.fileName, JSON.stringify(this.portfolio_data, null, 2));
      this.update_selected_data(lastPortfolio);
      this.get_stock_prices();
    },

    add_stock_dialog() {
      this.is_processing_stock = true;
    },

    close_stocks(closeObj) {
      this.stock_data.forEach(stock => {
        if (stock.id === closeObj.stock.id) {
          stock.closed = true;
          stock.close_price = closeObj.close_price;
          return;
        }

        console.log(stock);
      });

      let lastPortfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.portfolio_data.last_portfolio;
      });

      // Updates the portfolio data file and the UI
      fs.writeFileSync(this.fileName, JSON.stringify(this.portfolio_data, null, 2));
      this.update_selected_data(lastPortfolio);
      this.get_stock_prices();
    },

    delete_stocks(stocks) {
      let lastPortfolio = this.portfolio_data.portfolios.find(portfolio => {
        return portfolio.id == this.portfolio_data.last_portfolio;
      });
      
      // Updates the portfolio data file and the UI
      lastPortfolio.stocks = this.stock_data.filter(stock => !stocks.includes(stock));
      fs.writeFileSync(this.fileName, JSON.stringify(this.portfolio_data, null, 2));
      this.update_selected_data(lastPortfolio);
      this.get_stock_prices();
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
            if (stock.closed) {
              stock.current_price = stock.close_price;
            } else {
              stock.current_price = stock.aux_price;
            }

            stock.var = stock.aux_var;
            stock.varpct = stock.aux_varpct / 100;
          });

          this.update_stock_prices();
          this.has_new_data = true;
          this.is_processing = false;
          setTimeout(() => {
            this.has_new_data = false;
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
        if (stock.position === "opening") {
          stock.result = (stock.current_price - stock.initial_price) * stock.amount;
        } else {
          stock.result = (stock.initial_price - stock.current_price) * stock.amount;
        }

        stock.resultpct = stock.result / (stock.initial_price * stock.amount);
        sum += parseFloat(stock.result);
      });

      this.final_result = parseFloat(sum);
      if (this.full_value === 0) {
        this.percent_result = 0;
      } else {
        this.percent_result = sum / this.full_value;
      }
    },

    get_available_stocks() {
      let base_url = "http://cotacoes.economia.uol.com.br/ws/asset/";
      this.$http
        .get(base_url + "stock/list?size=10000")
        .then(response => {
          response.data.data.forEach(stock => {
            stock.code = stock.code.split(".")[0];
            this.available_stocks.push(stock);
          });
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
