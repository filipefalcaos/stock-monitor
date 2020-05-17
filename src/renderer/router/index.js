import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/pages/MainPage').default
    },
    {
      path: '/stats',
      name: 'stats',
      component: require('@/pages/StatsPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
