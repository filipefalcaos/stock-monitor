export default [
  {
    _name: 'CSidebarNav',
    _children: [
      {
        _name: 'CSidebarNavItem',
        name: 'Dashboard',
        to: '/dashboard',
        icon: 'cil-graph'
      },
      {
        _name: 'CSidebarNavTitle',
        _children: ['Operações']
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Carteiras',
        to: '/portfolios',
        icon: 'cil-wallet'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Opções',
        to: '/options',
        icon: 'cil-cash'
      },
      {
        _name: 'CSidebarNavTitle',
        _children: ['Relatórios']
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Resultados',
        to: '/res-report',
        icon: 'cil-chart-pie'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Impostos',
        to: '/res-taxes',
        icon: 'cil-bank'
      },
    ]
  }
]
