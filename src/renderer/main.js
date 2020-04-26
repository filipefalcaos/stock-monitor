import Vue from 'vue'
import axios from 'axios'
import { Button, Select, Table } from 'buefy'
import { Notification, Dialog, Modal } from 'buefy'
import { Field, Input, Radio, Autocomplete } from 'buefy'
import 'buefy/dist/buefy.css'

import App from './App'
import router from './router'

// Buefy config
Vue.use(Button);
Vue.use(Select);
Vue.use(Table);
Vue.use(Notification);
Vue.use(Dialog);
Vue.use(Modal);
Vue.use(Field);
Vue.use(Input);
Vue.use(Radio);
Vue.use(Autocomplete);

// Vue config
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

// New Vue instance
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app');
