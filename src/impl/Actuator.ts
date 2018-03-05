import * as urllib from 'urllib'
import { Context } from 'koa'
import { GlobalConfigProcessor } from 'dorapan'

const globalConfig = GlobalConfigProcessor.getInstance().getAllProperties()
const actuatorPort = globalConfig.actuator.http.port

export interface IMetric {
  interval: number
  level: string
  metric: string
  tags: { [key: string]: string }
  timestamp: number
  type: 'GAUGE'
  value: number
}

export class Actuator {
  public static route = '/metrics';

  public get appName() {
    return process.env.METRICS_APP_NAME || 'dashboard'
  }

  public async get (ctx: Context) {
    const metrics = await Promise.all(
      ['system', 'node', 'error']
        .map(metric => Actuator.get(metric, this.appName))
    )
    ctx.body = metrics.join('\n')
  }

  public static async get (metric: string, appName: string) {
    const backend = process.env.DASHBOARD_BACKEND || 'http://127.0.0.1:' + actuatorPort
    const remoteUrl = backend + '/metrics/' + metric + '?appName=' + appName
    const res = await urllib.request(remoteUrl, {
      timeout: 5000,
      dataType: 'json'
    })
    const { success, data } = res.data;
    if (success) {
      return this.generateMetrics(data)
    }
    return ''
  }

  public static generateMetrics(data: IMetric[]) {
    const metrics = data
      .filter(item => item.value != null)
      .map(item => {
        let { metric, tags, value, type } = item
        metric = metric.replace(/\./g, '_')
        const labelKeys = Object.keys(tags)
        const labels = labelKeys.map(lk => `${lk}=${JSON.stringify(String(tags[lk]))}`)
        return `
# TYPE ${metric} ${type.toLocaleLowerCase()}
${metric}{${labels.join(',')}} ${value}`
      })
    return metrics.join('\n')
  }
}
