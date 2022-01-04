
<template>
       <n-layout style="height: 1660px;">
    <n-layout-header style="height: 64px; padding: 24px;" bordered> 
      {{shared.jp.title ||'Joker Poker' }}
      
       <n-image v-if="!init"
    src="tail-spin.svg" />
      </n-layout-header
    >
    <n-layout position="absolute" style="top: 64px;">
      <n-layout content-style="padding: 24px;" :native-scrollbar="false">
         ID : {{myID}}<br/>
         Shared
         <pre>
            {{shared}}
          </pre>
          <p 
                v-for="u in this.shared.users"
                :key="u"
              >{{u.name}}
              </p>
              <n-input v-model:value="shared.jp.title" type="text" placeholder="Title" />
              <div v-if="init">
              <n-input v-model:value="myself.name" type="text" placeholder="" /> 
              </div>
          <n-button>naive-ui</n-button> 
            <n-menu @update:value="handleUpdateValue" :options="menuOptions" v-model:value="currentPageId" />

   
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
import { defineComponent,h } from "vue"
import { syncedStore, getYjsValue, filterArray } from "@syncedstore/core"
import { WebrtcProvider } from "y-webrtc"
import { IndexeddbPersistence } from "y-indexeddb"
import { uuidv4 } from "lib0/random"
import * as awarenessProtocol from "y-protocols/awareness"
import {Doc} from 'yjs'
import { PeopleSettings20Filled, PersonSettings20Filled, People20Filled, Person20Filled} from '@vicons/fluent'

const pathname = document.location.pathname
var id : string

if(pathname.length < 2) {
  id = uuidv4()
  window.history.pushState({ }, '', document.location.origin+'/'+ id)
} else {
  id = pathname.split('#')[0]
}


interface Indentified {id:string}
interface User extends Indentified { 
  name: string, 
  createdAt: number, 
  icon: string,
  online: boolean 
}
interface JokerPoker {
   title : string,
}

const store = syncedStore({ 
    jp : {} as JokerPoker,
    users : [] as User[]
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

var myID = localStorage.getItem(id) as string
if(!myID) {
  myID = uuidv4()
  localStorage.setItem(id,myID)
}

awareness.setLocalState({id: myID} as Indentified)

function renderIcon (icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

export default defineComponent({
  components : {
    PeopleSettings20Filled,
    PersonSettings20Filled,
    People20Filled,
    Person20Filled,
    },

  data() {
    return {
      myID : myID,
      shared: store,
      init : false,
      currentPageId : 'team',
      menuOptions : [
         {
            label: 'Team',
            key: 'team',
            icon: renderIcon(People20Filled)
         },
         {
            label: 'Me',
            key: 'me',
            icon: renderIcon(Person20Filled)
         },
         {
            label: 'Team Settings',
            key: 'teamSettings',
            icon: renderIcon(PeopleSettings20Filled)
          },
          {
            label: 'My Settings',
            key: 'mySettings',
            icon: renderIcon(PersonSettings20Filled)
          }
      ]
    }
  },

  created(){
    this.onHashChange()
    window.addEventListener("hashchange", this.onHashChange)
    awareness.on("change", (changes: any) => {
      console.log("awareness",changes)
      this.syncAwareness()
    })
    this.syncAwareness()
  },

  computed: {
    pageIDs() : string[] {
      return this.menuOptions.map(o => o.key)
    },
    myself() : User {
      var users = this.shared.users
      var me = users.find(u => u.id == myID)
      if(me) return me
      me = {name :'', createdAt : new Date().getTime(), icon : '', id : myID, online : true }
      users.push(me)
      // we have to search again to get the registered object. || me just keeps the compiler happy 
      return users.find(u => u.id == myID) || me
    },
  },

  watch : {
      "shared.jp.title" : function(val) {
        document.title = val
      }
  },

  methods: {
    handleUpdateValue (key : string, item: any) {
        window.location.hash = key
    },

    onHashChange() {
      const hash = window.location.hash.substring(1)
      if (this.pageIDs.includes(hash)) {
        this.currentPageId = hash
      } else {
        window.location.hash = ""
        this.currentPageId = "team"
      }
    },

    syncAwareness(){
      const awarenesStates = Array.from(awareness.getStates().values()) as Indentified[]
      this.shared.users.forEach(u=>{
        console.log("awareness",u,awarenesStates.find(i => i.id == u.id))
        u.online = awarenesStates.find(i => i.id == u.id) != undefined
      })
    },
  },
})

import{Initializer} from "./Initializer"
import { NIcon } from "naive-ui"

new Initializer(
  ydoc,
  webrtcProvider, ()=>{ window.vm.init = true},
  111)
</script>
