import {WebServer} from './WebServer'
import {Actuator} from './impl/Actuator'

export default class Exporter extends WebServer {

  public getRoutes () {
    return [ Actuator ]
  }

  public getPort () {
    const port: number = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 9082
    const host: string = process.env.METRICS_HOST || '127.0.0.1'
    return { port, host }
  }

  public async start () {
    await super.start()
    const { port, host } = this.getPort()
    console.log(`Pandora.js Metrics Exporter started, open http://${host}:${port}/`)
  }
}
