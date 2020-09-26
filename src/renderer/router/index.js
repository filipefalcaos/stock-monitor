import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/portfolios',
      name: 'portfolios',
      component: require('@/pages/PortfolioPage').default
    },
    {
      path: '/options',
      name: 'options',
      component: require('@/pages/OptionsPage').default
    },
    {
      path: '/',
      name: 'stats',
      component: require('@/pages/StatsPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
});
