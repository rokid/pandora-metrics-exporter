import * as urllib from 'urllib'
import { Context } from 'koa'
import { GlobalConfigProcessor } from 'dorapan'

const globalConfig = GlobalConfigProcessor.getInstance().getAllProperties()
const actuatorPort = globalConfig.actuator.http.port

import {MetricsClientUtil} from 'dorapan';
const client = MetricsClientUtil.getMetricsClient();
 
let counter = client.getCounter('test', 'test.qps.counter');
let histogram = client.getHistogram('test', 'test.qps.histogram');
let meter = client.getMeter('test', 'test.qps.meter');
let timer = client.getTimer('test', 'test.qps.timer');
 
counter.inc(2);
counter.dec(1);
histogram.update(5);
meter.mark(4);

export interface IMetric {
  interval: number
  level: string
  metric: string
  tags: { [key: string]: string }
  timestamp: number
  type: 'GAUGE' | 'COUNTER' | 'DELTA'
  value: number
}

function flatten<T> (list: T[][]): T[] {
  return list.reduce((prev, curr) => prev.concat(curr), [])
}

export class Actuator {
  public static route = '/metrics';

  public get appName() {
    return process.env.METRICS_APP_NAME || 'dashboard'
  }

  public async get (ctx: Context) {
    const apps = await Actuator.listApps()
    const metrics = await Promise.all(apps.map(async app => {
      const domains = await Actuator.list(app)
      const metrics = await Promise.all(domains.map(it => Actuator.get(it, app)))
      return metrics
    }))
    ctx.body = flatten(metrics).join('\n')
  }

  public static url (path: string): string {
    const backend = process.env.DASHBOARD_BACKEND || 'http://127.0.0.1:' + actuatorPort
    return backend + path
  }

  public static async listApps(): Promise<string[]> {
    const remoteUrl = this.url('/info')
    const res = await urllib.request(remoteUrl, {
      timeout: 5000,
      dataType: 'json'
    })
    const { success, data } = res.data
    if (success) {
      return Object.keys(data)
    }
    return []
  }

  public static async list (appName: string): Promise<string[]> {
    const remoteUrl = this.url('/metrics/list' + '?appName=' + appName)
    const res = await urllib.request(remoteUrl, {
      timeout: 5000,
      dataType: 'json'
    })
    const { success, data } = res.data
    if (success) {
      return Object.keys(data)
    }
    return []
  }

  public static async get (metric: string, appName: string): Promise<string> {
    const remoteUrl = this.url('/metrics/' + metric + '?appName=' + appName)
    const res = await urllib.request(remoteUrl, {
      timeout: 5000,
      dataType: 'json'
    })
    const { success, data } = res.data
    if (success) {
      return this.generateMetrics(data, appName)
    }
    return ''
  }

  public static generateMetrics(data: IMetric[], appName: string) {
    const metrics = data
      .filter(item => item.value != null)
      .map(item => {
        let { metric, tags, value, type } = item
        metric = metric.replace(/\./g, ':')
        Object.assign(tags, { appName })
        const labelKeys = Object.keys(tags)
        const labels = labelKeys.map(lk => `${lk}=${JSON.stringify(String(tags[lk]))}`)
        return `
# TYPE ${metric} ${type.toLocaleLowerCase()}
${metric}{${labels.join(',')}} ${value}`
      })
    return metrics.join('\n')
  }
}
