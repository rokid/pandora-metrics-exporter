module.exports = (pandora) => {
  pandora
    .process('worker')
    .scale(1)
  pandora
    .process('worker')
    .nodeArgs()
    .push('-r', 'ts-node/register', '--trace-warnings')
  pandora
    .service('exporter', './src/Exporter')
    .process('worker')
}
