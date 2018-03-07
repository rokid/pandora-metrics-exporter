const { MetricsEndPoint } = require('pandora')
const { PrometheusResource } = require('./PrometheusResource')

module.exports.default = {
  actuator: {
    endPoint: {
      prometheus: {
        enabled: true,
        target: MetricsEndPoint,
        resource: PrometheusResource
      }
    }
  }
}
