import {Doc} from 'yjs'
import { WebrtcProvider } from "y-webrtc"

export class Initializer {
    busyStart = -1
    doc: Doc
    webrtcProvider : WebrtcProvider
    until : Function
    andThen : Function
    timer = 0
    initTimeout:number
    
    constructor(doc: Doc, webrtcProvider : WebrtcProvider, until : Function, andThen : Function, initTimeout:number) {
      this.doc = doc
      this.until = until
      this.andThen = andThen
      this.webrtcProvider = webrtcProvider
      this.initTimeout = initTimeout
      this.doc.on("beforeAllTransactions", this.beforeAllTransactions.bind(this)) 
      this.doc.on("afterAllTransactions", this.afterAllTransactions.bind(this)) 
    }
  
    beforeAllTransactions() : void {
      if(this.busyStart < -10 || !this.webrtcProvider.connected) return
      if(this.timer) window.clearTimeout(this.timer)
      console.log("ydoc busy")
      this.busyStart = new Date().getTime()
    }
  
    afterAllTransactions(): void {
      if(this.busyStart < 0) return
      const duration = new Date().getTime() - this.busyStart
      console.log("ydoc calm after", duration)     
      if(this.until()) {
         console.log("ydoc condition reached")
         this.fire()
      }
      this.timer = window.setTimeout(this.fire.bind(this),this.initTimeout)
    }

    fire() : void {
      this.busyStart = -11
      if(this.timer) window.clearTimeout(this.timer)
      this.doc.off("beforeAllTransactions", this.beforeAllTransactions.bind(this))
      this.doc.off("afterAllTransactions", this.afterAllTransactions.bind(this))
      console.log("ydoc init fire") 
      this.andThen()
    }
  
}