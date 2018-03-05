module.exports = (pandora) => {
  pandora
    .process('worker')
    .scale(1)
    .env({ DASHBOARD_HOST: '0.0.0.0' })
  if (pandora.dev) {
    pandora
      .process('worker')
      .nodeArgs()
      .push('-r', 'ts-node/register', '--trace-warnings')
    pandora
      .service('dashboard', './src/Exporter')
      .process('worker')
  } else {
    pandora
      .service('dashboard', './dist/Exporter')
      .process('worker')
  }
}
