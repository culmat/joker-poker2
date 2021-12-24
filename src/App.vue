
<template>

         

       <n-layout style="height: 660px;">
    <n-layout-header style="height: 64px; padding: 24px;" bordered
      > {{shared.root.jp ? shared.root.jp.title : 'loading'}}</n-layout-header
    >
    <n-layout position="absolute" style="top: 64px;">
      <n-layout content-style="padding: 24px;" :native-scrollbar="false">
         ID : {{myID}} , {{initialized}}<br/>
         Shared
         <pre>
            {{shared}}
          </pre>
          Awareness
          <pre>
            {{awareness}}
          </pre>  
          <div v-if="initialized">
          <p 
                v-for="u in this.shared.root.jp.users"
                :key="u"
              >{{u.name}}
              </p>
              <n-input v-model:value="shared.root.jp.title" type="text" placeholder="Title" />
              <n-input v-model:value="myself.name" type="text" placeholder="" />      
          <n-button>naive-ui</n-button> 
          </div>
      </n-layout>
    </n-layout>
  </n-layout>


</template>

<style>
.n-layout-header{
  background-color: lightgrey;
}
</style>

<script lang="ts">
import { defineComponent } from "vue"
import { syncedStore, getYjsValue, filterArray } from "@syncedstore/core"
import { WebrtcProvider } from "y-webrtc"
import { IndexeddbPersistence } from "y-indexeddb"
import { uuidv4 } from "lib0/random"
import * as awarenessProtocol from "y-protocols/awareness"
import {Doc} from 'yjs'
import {Initializer} from "./Initializer"

const urlTokens = document.URL.split('/~/')
var id : string
var initTimeout = 222
if(urlTokens.length > 1 && urlTokens[1].length >0) {
  id = urlTokens[1].split('#')[0]
} else {
  id = uuidv4()
  window.history.pushState({ }, '', urlTokens[0]+'~/'+ id)
  initTimeout = 22
}


interface Indentified {id:string}
interface User extends Indentified { name: string, createdAt: number, icon: string }
interface Root {jp : JokerPoker}
interface JokerPoker {
   title : string,
   users : User[]
}

const store = syncedStore({ 
    root : {} as Root
  })


const ydoc = getYjsValue(store) as Doc

const webrtcProvider = new WebrtcProvider(id, ydoc)
// , {
//   // see https://github.com/yjs/y-webrtc#user-content-api
//   signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
//   password: id.split("").reverse().join("!"),
//   awareness: new awarenessProtocol.Awareness(ydoc),
//   maxConns: 27 +  Math.floor(Math.random() * 15),
//   filterBcConns: true,
//   peerOpts: {}
// })




new IndexeddbPersistence(id, ydoc)

// All of our network providers implement the awareness crdt
const awareness = webrtcProvider.awareness
console.log("clientID", awareness.clientID)

// You can observe when a user updates their awareness information
awareness.on("change", (changes: any) => {
  // Whenever somebody updates their awareness information,
  // we log all awareness information from all users.
  console.log("awareness",changes)
  const awarenesStates = Array.from(awareness.getStates().values()) as Indentified[]
  console.log("awareness",awarenesStates)
})

var myID = localStorage.getItem(id) as string
if(!myID) {
  myID = uuidv4()
  localStorage.setItem(id,myID)
}

awareness.setLocalState({id: myID} as Indentified)

 
export default defineComponent({
  data() {
    return {
      myID : myID,
      shared: store,
      awareness : {states:awareness.states, meta:awareness.meta},
      initialized : false
    }
  },

  computed: {

    myself() : User {
      var users = this.jp().users
      var me = users.find(u => u.id == myID)
      if(me) return me
      me = {name :'', createdAt : new Date().getTime(), icon : '', id : myID }
      users.push(me)
      // we have to search again to get the registered object. || me just keeps the compiler happy 
      return users.find(u => u.id == myID) || me
    },
  },

  watch : {
      "shared.root.jp.title" : function(val) {
        document.title = val
      }
  },

  methods: {
    init(){
        if(this.initialized) return
        console.log("init", this.myself.id)
        this.initialized = true
    },
  
    jp() : JokerPoker {
      if (!this.shared.root.jp) this.shared.root.jp = { title : 'Joker Poker',users : []}
      return this.shared.root.jp
    },

  },
})
declare global {
  interface Window {
      vm:any
  }
}
new Initializer(ydoc,webrtcProvider, ()=>{return store.root.jp}, ()=>{
  window.vm.init()
},initTimeout)
</script>
