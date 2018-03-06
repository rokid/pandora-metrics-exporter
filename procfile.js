module.exports = (pandora) => {
  pandora
    .process('worker')
    .scale(1)
    .env({ METRICS_APP_NAME: 'pandora-metrics-exporter' })
  pandora
    .process('worker')
    .nodeArgs()
    .push('-r', 'ts-node/register', '--trace-warnings')
  pandora
    .service('exporter', './src/Exporter')
    .process('worker')
}
