import Vue from 'vue'
import axios from 'axios'
import { Button, Icon, Select, Table, Sidebar, Menu } from 'buefy'
import { Notification, Dialog, Modal } from 'buefy'
import { Field, Input, Radio } from 'buefy'

import App from './App'
import router from './router'
import store from './store'

// Buefy config
Vue.use(Button);
Vue.use(Icon);
Vue.use(Select);
Vue.use(Table);
Vue.use(Sidebar);
Vue.use(Menu);
Vue.use(Notification);
Vue.use(Dialog);
Vue.use(Modal);
Vue.use(Field);
Vue.use(Input);
Vue.use(Radio);

// Vue config
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// New Vue instance
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
