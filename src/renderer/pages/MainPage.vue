<!-- Template -->
<template>
  <section :class="process.platform === 'win32' ? 'section-win' : 'section'">
    <nav class="level">
      <div class="level-left">
        <div class="level-item">
          <b-button @click="$emit('toggle-menu')" type="is-light" icon-left="menu">Menu</b-button>
        </div>

        <div style="margin-left: 2rem;" class="level-item">
          <b-select
            @input="load_portfolio"
            v-model="portfolioData.last_portfolio"
            placeholder="Carteira"
            expanded
          >
            <option
              v-for="option in portfolioData.portfolios"
              :value="option.id"
              :key="option.id"
            >{{ option.name }}</option>
          </b-select>
        </div>

        <div class="level-item">
          <b-button @click="add_portfolio_dialog" icon-left="plus" type="is-success">Carteira</b-button>
        </div>

        <div class="level-item">
          <b-button
            @click="get_stock_prices"
            :loading="is_processing"
            icon-left="sync"
            type="is-info"
          >Atualizar</b-button>
        </div>
      </div>

      <div class="level-right">
        <div class="level-item">
          <h1
            class="title"
            :class="process.platform === 'win32' ? 'base-text-win' : 'base-text'"
            style="float: right;"
          >
            <b>Total:</b>
            <span style="margin-right: 0.5rem;">{{ format_currency(investment) }}</span>
            <span>|</span>

            <b style="margin-left: 0.5rem;">Ativo:</b>
            <span style="margin-right: 0.5rem;">{{ format_currency(activeInvestment) }}</span>
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
    </nav>

    <nav class="level">
      <div class="level-left">
        <div class="level-item" style="margin-right: 0;">
          <h1
            class="title"
            :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
          >Em aberto</h1>
        </div>

        <div class="level-item">
          <b-icon v-if="show_open" @click.native="show_open = (show_open ? false : true)" icon="menu-down" />
          <b-icon v-if="!show_open" @click.native="show_open = (show_open ? false : true)" icon="menu-up" />
        </div>
      </div>

      <div class="level-right">
        <b-button
          @click="modal_add_active = true"
          style="float: right;"
          type="is-info"
          icon-left="plus"
        >Ativo</b-button>
      </div>
    </nav>

    <!-- Table of open positions -->
    <div v-if="show_open" class="columns">
      <div class="column is-full">
        <stock-table
          v-on:close-stock="close_stock_dialog"
          v-on:delete-stocks="delete_stocks"
          :stock-data="openStocks"
          :has-new-data="has_new_data"
        />
      </div>
    </div>

    <nav class="level">
      <div class="level-left">
        <div class="level-item" style="margin-right: 0;">
          <h1
            class="title"
            :class="process.platform === 'win32' ? 'title-text-win' : 'title-text'"
          >Encerradas</h1>
        </div>

        <div class="level-item">
          <b-icon v-if="show_closed" @click.native="show_closed = (show_closed ? false : true)" icon="menu-down" />
          <b-icon v-if="!show_closed" @click.native="show_closed = (show_closed ? false : true)" icon="menu-up" />
        </div>
      </div>
    </nav>

    <!-- Table of closed positions -->
    <div v-if="show_closed" class="columns">
      <div class="column is-full">
        <stock-table
          v-on:close-stock="close_stock_dialog"
          v-on:delete-stocks="delete_stocks"
          :stock-data="closedStocks"
          :has-new-data="has_new_data"
        />
      </div>
    </div>

    <!-- Modal to add stocks -->
    <b-modal
      :active.sync="modal_add_active"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <stock-form v-on:submit-stock="add_stock" :stocks="availableStocks" />
    </b-modal>

    <!-- Modal to close stocks -->
    <b-modal
      :active.sync="modal_close_active"
      has-modal-card
      trap-focus
      aria-role="dialog"
      aria-modal
    >
      <close-stock-form v-on:update-stock="close_stocks" :to-close="stock_to_close" />
    </b-modal>
  </section>
</template>

<!-- Script -->
<script>
import { nanoid } from "nanoid";
import { mapGetters, mapState } from "vuex";

import StockTable from "../components/StockTable";
import StockForm from "../components/StockForm";
import CloseStockForm from "../components/CloseStockForm";

export default {
  name: "main-page",
  components: { StockTable, StockForm, CloseStockForm },

  // Gets the last state of the portfolio data. Also, gets the current state
  // of the stocks when the component is created
  async created() {
    this.$store.commit("setDataFileName");
    this.$store.commit("loadDataFile");

    // Starts the UI state
    this.$store.commit("setCurrentStocks", this.lastPortfolio.stocks);
    this.get_stock_prices();
    await this.$store.dispatch('getAvailableStocks');
  },

  data() {
    return {
      process: process,
      has_new_data: false,
      is_processing: false,
      modal_add_active: false,
      modal_close_active: false,
      has_error: false,
      show_open: true,
      show_closed: false,
      final_result: 0,
      percent_result: 0,
      stock_to_close: null
    };
  },

  computed: {
    ...mapState({
      dataFileName: state => state.portfolios.dataFileName,
      portfolioData: state => state.portfolios.portfolioData,
      currentStocks: state => state.portfolios.currentStocks,
      availableStocks: state => state.stocks.availableStocks
    }),

    ...mapGetters({
      lastPortfolio: "lastPortfolio",
      investment: "investment",
      activeInvestment: "activeInvestment",
      openStocks: "openStocks",
      closedStocks: "closedStocks"
    })
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

    load_portfolio() {
      this.$store.commit("updateDataFile");
      this.$store.commit("setCurrentStocks", this.lastPortfolio.stocks);
      this.get_stock_prices();
    },

    create_portfolio(portfolio_name) {
      this.final_result = 0;
      this.percent_result = 0;
      this.$store.commit("newPortfolio", portfolio_name);
      this.$store.commit("updateDataFile");
      this.$store.commit("setCurrentStocks", this.lastPortfolio.stocks);
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
      this.$store.commit("addToPortfolio", new_stock);
      this.$store.commit("updateDataFile");
      this.$store.commit("setCurrentStocks", this.lastPortfolio.stocks);
      this.get_stock_prices();
    },

    close_stocks(closeObj) {
      this.$store.commit("closePosition", closeObj);
      this.$store.commit("updateDataFile");
      this.$store.commit("setCurrentStocks", this.lastPortfolio.stocks);
      this.get_stock_prices();
    },

    close_stock_dialog(stock) {
      this.stock_to_close = stock;
      this.modal_close_active = true;
    },

    delete_stocks(positions) {
      this.$store.commit("deletePosition", positions);
      this.$store.commit("updateDataFile");
      this.$store.commit("setCurrentStocks", this.lastPortfolio.stocks);
      this.get_stock_prices();
    },

    get_stock_prices() {
      let promises = [];
      let base_url = "http://cotacoes.economia.uol.com.br/ws/asset/";
      this.is_processing = true;
      this.has_error = false;

      // Gets the most recent price of each stock
      this.currentStocks.forEach(stock => {
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
          this.currentStocks.forEach(stock => {
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
      this.currentStocks.forEach(stock => {
        if (stock.position === "opening") {
          stock.result = (stock.current_price - stock.initial_price) * stock.amount;
        } else {
          stock.result = (stock.initial_price - stock.current_price) * stock.amount;
        }

        stock.resultpct = stock.result / (stock.initial_price * stock.amount);
        sum += parseFloat(stock.result);
      });

      this.final_result = parseFloat(sum);
      if (this.investment === 0) {
        this.percent_result = 0;
      } else {
        this.percent_result = sum / this.investment;
      }
    }
  }
};
</script>
