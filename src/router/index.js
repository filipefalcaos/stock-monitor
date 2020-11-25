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
          name: 'Carteiras',
          component: Portfolios
        },
        {
          path: 'options',
          name: 'Opções',
          component: UnderConstruction
        },
        {
          path: 'res-report',
          name: 'Relatórios',
          component: UnderConstruction
        },
        {
          path: 'res-taxes',
          name: 'Impostos',
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
