import axios from "axios";
import { NotificationProgrammatic } from "buefy";

// Initial state
const state = () => ({
  availableStocks: [],
  apiError: false,
  apiBaseUrl: "http://cotacoes.economia.uol.com.br/ws/asset/"
});

// Getters
const getters = {}

// Actions
const actions = {
  async getAvailableStocks({ commit, state }) {
    axios
      .get(state.apiBaseUrl + "stock/list?size=10000")
      .then(response => {
        response.data.data.forEach(stock => {
          stock.code = stock.code.split(".")[0];
          commit('addAvailableStock', stock);
        });
      })
      .catch(error => {
        NotificationProgrammatic.open({
          duration: 5000,
          message:
            "Não foi possível obter a lista de ações. Por favor, cheque sua conexão.",
          position: "is-bottom-right",
          type: "is-danger"
        });
      });
  }
}

// Mutations
const mutations = {
  addAvailableStock(state, stock) {
    state.availableStocks.push(stock);
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
