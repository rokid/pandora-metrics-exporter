import * as Koa from 'koa'
import * as Router from 'koa-router'

import {createServer, Server} from 'http'

const methods = ['get', 'put', 'post', 'patch', 'delete', 'del']

export abstract class WebServer extends Koa {
  private server: Server;
  private router: any;

  public constructor (private pandoraContext: any) {
    super()
    this.router = new Router()
    this.server = createServer(this.callback() as any)
    this.setup()
    this.use(this.router.routes())
    this.use(this.router.allowedMethods())
  }

  public setup () {
    const router = this.router
    const routes: any[] = this.getRoutes()
    for (const Route of routes) {
      const routePath = Route.route
      const route = new Route(this)
      if (route.setup) {
        route.setup()
      }
      for (const method of methods) {
        if (route[method]) {
          router[method](routePath, route[method].bind(route))
        }
      }
    }
  }

  public abstract getRoutes(): any[];
  public abstract getPort(): {
    port: number
    host: string
  };

  public async start () {
    const { port, host } = this.getPort()
    await new Promise((resolve, reject) => {
      this.server.listen({ port, host }, (err: any) => {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }

  async stop () {
    await new Promise((resolve) => {
      this.server.close(resolve)
    })
  }
}
