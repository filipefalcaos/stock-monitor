import { remote } from "electron";
import { nanoid } from "nanoid";
import path from "path";
const fs = require("fs");

// Initial state
const state = () => ({
  dataFileName: "",
  portfolioData: {},
  currentStocks: []
});

// Getters
const getters = {
  lastPortfolio: (state) => {
    return state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });
  },

  investment: (state, getters) => {
    state; /* Unused */
    return getters.lastPortfolio.stocks.reduce((total, stock) => {
      return total + stock.initial_price * stock.amount;
    }, 0);
  },

  activeInvestment: (state, getters) => {
    state; /* Unused */

    return getters.investment - getters.lastPortfolio.stocks.reduce((total, stock) => {
      if (stock.closed) {
        return total + stock.initial_price * stock.amount;
      } else {
        return total;
      }
    }, 0);
  },

  openStocks: (state) => {
    return state.currentStocks.filter(stock => !stock.closed);
  },

  closedStocks: (state) => {
    return state.currentStocks.filter(stock => stock.closed);
  }
}

// Actions
const actions = {
  getAllProducts({ commit }) {
    shop.getProducts(products => {
      commit('setProducts', products)
    });
  }
}

// Mutations
const mutations = {
  setDataFileName(state) {
    const dataPath = "/portfolio-data.json";
    state.dataFileName = path.join(remote.app.getPath("userData"), dataPath);
  },

  loadDataFile(state) {
    try {
      if (fs.existsSync(state.dataFileName)) {
        state.portfolioData = JSON.parse(fs.readFileSync(state.dataFileName));
      } else {
        state.portfolioData = {
          last_portfolio: null,
          portfolios: []
        };

        fs.writeFileSync(state.dataFileName, JSON.stringify(state.portfolioData));
      }
    } catch (error) {
      console.error(error);
    }
  },

  updateDataFile(state) {
    let portfolioCopy = JSON.parse(JSON.stringify(state.portfolioData));

    // Delete fields that should not be persisted
    portfolioCopy.portfolios.forEach(portfolio => {
      portfolio.stocks.forEach(stock => {
        delete stock.aux_price;
        delete stock.aux_var;
        delete stock.aux_varpct;
        delete stock.var;
        delete stock.varpct;

        if (!stock.closed) {
          delete stock.result;
          delete stock.resultpct;
          delete stock.current_price;
        }
      });
    });

    fs.writeFileSync(state.dataFileName, JSON.stringify(portfolioCopy, null, 2));
  },

  newPortfolio(state, portfolioName) {
    state.portfolioData.last_portfolio = nanoid();
    state.portfolioData.portfolios.push({
      id: state.portfolioData.last_portfolio,
      name: portfolioName,
      stocks: []
    });
  },

  setCurrentStocks(state, stocks) {
    state.currentStocks = stocks;
  },

  addToPortfolio(state, stockData) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });

    lastPortfolio.stocks.push({
      id: nanoid(),
      stock: stockData.stock.code,
      uol_code: stockData.stock.idt,
      initial_price: stockData.initial_price,
      amount: stockData.amount,
      position: stockData.position,
      closed: false
    });
  },

  closePosition(state, closeObj) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });

    // Checks if a new stock must be created and closed (partial closing), or just close
    // the existing one
    if (closeObj.new_amount === closeObj.old_stock.amount) {
      state.currentStocks.forEach(stock => {
        if (stock.id === closeObj.old_stock.id) {
          stock.closed = true;
          stock.close_price = closeObj.close_price;
          return;
        }
      });
    } else {
      let diff = closeObj.old_stock.amount - closeObj.new_amount;

      // Updates the remaining amount
      state.currentStocks.forEach(stock => {
        if (stock.id === closeObj.old_stock.id) {
          stock.amount = diff;
          return;
        }
      });

      // Adds a new stock to partially close
      lastPortfolio.stocks.push({
        id: nanoid(),
        stock: closeObj.old_stock.stock,
        uol_code: closeObj.old_stock.uol_code,
        initial_price: closeObj.old_stock.initial_price,
        amount: closeObj.new_amount,
        position: closeObj.old_stock.position,
        closed: true,
        close_price: closeObj.close_price,
        current_price: closeObj.close_price
      });
    }
  },

  deletePosition(state, positions) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });

    lastPortfolio.stocks = state.currentStocks.filter(stock => !positions.includes(stock));
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
