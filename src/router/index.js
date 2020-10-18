import Vue from 'vue'
import Router from 'vue-router'

// Containers
const Container = () => import('@/containers/Container')

// Views
const Dashboard = () => import('@/views/Dashboard')
const Portfolios = () => import('@/views/Portfolios')
const UnderConstruction = () => import('@/views/UnderConstruction')

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      name: 'Home',
      component: Container,
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'portfolios',
          name: 'Portfolios',
          component: Portfolios
        },
        {
          path: 'options',
          name: 'Options',
          component: UnderConstruction
        },
        {
          path: 'res-report',
          name: 'Results',
          component: UnderConstruction
        },
        {
          path: 'res-taxes',
          name: 'Taxes',
          component: UnderConstruction
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
