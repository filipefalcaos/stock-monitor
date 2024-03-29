# stock-monitor

A Vue app on top of Electron that tracks the performance of equities portfolios and options operations. Currently supported equities for price data include all the available on Yahoo Finance. For dividend data, only Brazilian equities are supported at the moment.

## Features

- Dashboard for overall performance tracking
- Tracks the performance of equities portfolios on any market supported by Yahoo Finance
- Tracks the performance of manually added options operations
- Accounts for dividends on portfolios of Brazilian equities

## Building

### Compiles and hot-reloads for development
```
yarn electron:serve
```

### Compiles and minifies for production
```
yarn electron:generate-icons
yarn electron:build
```

### Lints and fixes files
```
yarn lint
```
