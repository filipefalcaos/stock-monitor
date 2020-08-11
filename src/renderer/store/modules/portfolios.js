import { remote } from "electron";
import { nanoid } from "nanoid";
import path from "path";
const fs = require("fs");

// Initial state
const state = () => ({
  dataFileName: "",
  portfolioData: {},
  currentPositions: []
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
    return getters.lastPortfolio.positions.reduce((total, position) => {
      return total + position.initial_price * position.amount;
    }, 0);
  },

  activeInvestment: (state, getters) => {
    state; /* Unused */

    return getters.investment - getters.lastPortfolio.positions.reduce((total, position) => {
      if (position.closed) {
        return total + position.initial_price * position.amount;
      } else {
        return total;
      }
    }, 0);
  },

  openPositions: (state) => {
    return state.currentPositions.filter(position => !position.closed);
  },

  closedPositions: (state) => {
    return state.currentPositions.filter(position => position.closed);
  }
}

// Actions
const actions = {}

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
      portfolio.positions.forEach(position => {
        delete position.aux_price;
        delete position.aux_var;
        delete position.aux_varpct;
        delete position.var;
        delete position.varpct;

        if (!position.closed) {
          delete position.result;
          delete position.resultpct;
          delete position.current_price;
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
      created_at: Date.now(),
      positions: []
    });
  },

  setCurrentPositions(state, positions) {
    state.currentPositions = positions;
  },

  addToPortfolio(state, postionData) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });

    lastPortfolio.positions.push({
      id: nanoid(),
      stock: postionData.stock.code,
      uol_code: postionData.stock.idt,
      initial_price: postionData.initial_price,
      amount: postionData.amount,
      type: postionData.type,
      created_at: Date.now(),
      closed: false
    });
  },

  closePosition(state, closeObj) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });

    // Checks if a new position must be created and closed (partial closing), or just close
    // the existing one
    if (closeObj.new_amount === closeObj.old_position.amount) {
      state.currentPositions.forEach(position => {
        if (position.id === closeObj.old_position.id) {
          position.closed = true;
          position.close_price = closeObj.close_price;
          position.closed_at = Date.now();
          return;
        }
      });
    } else {
      let diff = closeObj.old_position.amount - closeObj.new_amount;

      // Updates the remaining amount
      state.currentPositions.forEach(position => {
        if (position.id === closeObj.old_position.id) {
          position.amount = diff;
          return;
        }
      });

      // Adds a new position to partially close
      lastPortfolio.positions.push({
        id: nanoid(),
        stock: closeObj.old_position.stock,
        uol_code: closeObj.old_position.uol_code,
        initial_price: closeObj.old_position.initial_price,
        amount: closeObj.new_amount,
        type: closeObj.old_position.type,
        closed: true,
        created_at: closeObj.old_position.created_at,
        closed_at: Date.now(),
        close_price: closeObj.close_price,
        current_price: closeObj.close_price
      });
    }
  },

  deletePosition(state, positions) {
    let lastPortfolio = state.portfolioData.portfolios.find(portfolio => {
      return portfolio.id == state.portfolioData.last_portfolio;
    });

    lastPortfolio.positions = state.currentPositions.filter(position => !positions.includes(position));
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
