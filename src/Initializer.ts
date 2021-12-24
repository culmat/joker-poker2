import {Doc} from 'yjs'
import { WebrtcProvider } from "y-webrtc"

export class Initializer {
    busyStart = -1
    doc: Doc
    webrtcProvider : WebrtcProvider
    andThen : Function
    timer = 0
    initTimeout:number
    
    constructor(
       doc: Doc, 
       webrtcProvider : WebrtcProvider, 
       andThen : Function, 
       initTimeout:number
       ) {
      this.doc = doc
      this.andThen = andThen
      this.webrtcProvider = webrtcProvider
      this.initTimeout = initTimeout
      this.doc.on("beforeAllTransactions", this.beforeAllTransactions.bind(this)) 
      this.doc.on("afterAllTransactions", this.afterAllTransactions.bind(this)) 
    }
  
    beforeAllTransactions() : void {
      if(!this.webrtcProvider.connected) return
      if(this.timer) window.clearTimeout(this.timer)
      console.log("ydoc busy")
      this.busyStart = new Date().getTime()
    }
  
    afterAllTransactions(): void {
      if(this.busyStart < 0) return
      const duration = new Date().getTime() - this.busyStart
      console.log("ydoc calm after", duration)     
      this.timer = window.setTimeout(this.fire.bind(this),this.initTimeout)
    }

    fire() : void {
      this.doc.off("beforeAllTransactions", this.beforeAllTransactions.bind(this))
      this.doc.off("afterAllTransactions", this.afterAllTransactions.bind(this))
      console.log("ydoc init fire") 
      this.andThen()
    }
  
}