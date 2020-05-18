import { remote } from "electron";
import path from "path";
const fs = require("fs");

// Initial state
const state = () => ({
  dataFileName: "",
  portfolioData: {}
});

// Getters
const getters = {
  lastPortfolio: (state) => {
    return state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });
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
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
