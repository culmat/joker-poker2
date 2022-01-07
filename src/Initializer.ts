import {Doc} from 'yjs'
import { WebsocketProvider } from "y-websocket"

export class Initializer {
    busyStart = -1
    doc: Doc
    connectionProvider : WebsocketProvider
    andThen : Function
    timer = 0
    initTimeout:number
    
    constructor(
       doc: Doc, 
       connectionProvider : WebsocketProvider, 
       andThen : Function, 
       initTimeout:number
       ) {
      this.doc = doc
      this.andThen = andThen
      this.connectionProvider = connectionProvider
      this.initTimeout = initTimeout
      this.doc.on("beforeAllTransactions", this.beforeAllTransactions.bind(this)) 
      this.doc.on("afterAllTransactions", this.afterAllTransactions.bind(this)) 
    }
  
    beforeAllTransactions() : void {
      if(!this.connectionProvider.wsconnected) return
      if(this.timer) window.clearTimeout(this.timer)
      this.busyStart = new Date().getTime()
    }
  
    afterAllTransactions(): void {
      if(this.busyStart < 0) return
      const duration = new Date().getTime() - this.busyStart
      this.timer = window.setTimeout(this.fire.bind(this),this.initTimeout)
    }

    fire() : void {
      this.doc.off("beforeAllTransactions", this.beforeAllTransactions.bind(this))
      this.doc.off("afterAllTransactions", this.afterAllTransactions.bind(this))
      this.andThen()
    }
  
}