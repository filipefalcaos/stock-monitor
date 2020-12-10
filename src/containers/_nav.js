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
        _name: 'CSidebarNavItem',
        name: 'Carteiras de Ações',
        to: '/portfolios',
        icon: 'cil-wallet'
      },
      {
        _name: 'CSidebarNavItem',
        name: 'Operação em Opções',
        to: '/options',
        icon: 'cil-cash'
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
