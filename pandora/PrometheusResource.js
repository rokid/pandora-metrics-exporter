const COMMON_METRIC_GROUPS = ['error', 'system']

function flatten (list) {
  return list.reduce((prev, curr) => prev.concat(curr), [])
}

class PrometheusResource {
  constructor (endPointService) {
    this.prefix = '/prometheus'
    this.endPointService = endPointService
  }

  get infoEndPoint () {
    return this.endPointService.getEndPoint('info')
  }

  get metricsEndPoint () {
    return this.endPointService.getEndPoint('metrics')
  }

  route (router) {
    router.get('/', async (ctx, next) => {
      try {
        const apps = await this.listApps()
        let metrics = await Promise.all(apps.map(async app => {
          const groups = await this.listMetricGroups(app)
          const metrics = await Promise.all(groups.map(it => this.getMetrics(it, app)))
          return metrics
        }))
        metrics = metrics.concat(await Promise.all(COMMON_METRIC_GROUPS.map(async group => {
          const metrics = await this.getMetrics(group)
          return metrics
        })))
        ctx.body = flatten(metrics).join('\n')
      } catch (err) {
        ctx.body = err.message + '\n' + err.stack
      }
    })
  }

  /**
   *
   * @returns {string[]} app name list
   */
  async listApps () {
    const appsInfo = await this.infoEndPoint.invoke()
    return Object.keys(appsInfo)
  }

  /**
   *
   * @param {string} appName app to fetch
   * @returns {string[]} metric groups
   */
  async listMetricGroups (appName) {
    return Object.keys(await this.metricsEndPoint.listMetrics(null, appName))
      .filter(it => COMMON_METRIC_GROUPS.indexOf(it) === -1)
  }

  /**
   *
   * @param {string} group group name to fetch
   * @param {string} appName app to fetch
   * @returns {string[]} list of formatted string representation of metrics
   */
  async getMetrics (group, appName) {
    const metrics = await this.metricsEndPoint.getMetricsByGroup(group, appName)
    return this.generateMetrics(metrics, appName)
  }

  generateMetrics (data, appName) {
    const metrics = data
      .filter(item => item.value != null)
      .map(item => {
        let { metric, tags, value, type } = item
        metric = metric.replace(/\./g, ':')
        Object.assign(tags, { appName })
        const labelKeys = Object.keys(tags)
        const labels = labelKeys
          .filter(lk => tags[lk] != null)
          .map(lk => `${lk}=${JSON.stringify(String(tags[lk]))}`)
        return `
# TYPE ${metric} ${type.toLocaleLowerCase()}
${metric}{${labels.join(',')}} ${value}`
      })
    return metrics.join('\n')
  }
}

module.exports = { PrometheusResource }
