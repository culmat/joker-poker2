
<template>
       <n-layout style="height: 1660px;">
    <n-layout-header style="height: 48px;  line-height: 48px; padding: 2px 24px 2px 24px;" bordered>
      {{shared.jp.title ||'Joker Poker' }}

      <n-tooltip trigger="hover">
    <template #trigger>
       <n-avatar
          round
          size="medium"
          style="float:right; margin-top: 5px;"
          :src="myself.icon"/>
    </template>
    {{myself.name}}
  </n-tooltip>

    </n-layout-header>
    <n-layout  position="absolute" style="top: 64px;" id="mainContent" has-sider>
       <n-layout-sider
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :native-scrollbar="false"
          style="max-height: 320px;"
        >
         <n-menu @update:value="handleUpdateValue" mode="vertical" :options="menuOptions" v-model:value="currentPageId"
            :collapsed-width="64"
            :collapsed-icon-size="22"
          />
        </n-layout-sider>

      <n-layout embedded content-style="padding: 24px;" >
        <n-card v-if="!init">
             Loading
            <n-image src="tail-spin.svg" />
        </n-card>
        <n-card v-if="init">
          <div v-if="currentPageId =='team/settings'">
              <n-form-item label="Name">
                <n-input v-model:value="shared.jp.title" type="text" placeholder="Team name" />
              </n-form-item>
              <pre>
                {{shared}}
              </pre>
            </div>
            <div v-if="currentPageId =='team/vote'">
                <p v-for="u in this.shared.users"
                  :key="u"
                >{{u.name}}</p>
            </div>
            <div v-if="currentPageId =='~/vote'">
                TBD
            </div>
            <div v-if="currentPageId =='~/settings'">
                <div v-if="init">
                   <n-form-item label="Name">
                    <n-input v-model:value="myself.name" type="text" placeholder="" /> 
                   </n-form-item>
                   <n-form-item label="Email">
                    <n-input v-model:value="myself.email" type="text" placeholder="" /> 
                   </n-form-item>
                </div>
            </div>
          </n-card> 
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<style>
.n-layout-header{
  background-color: lightgrey;
}

@media only screen and (max-width: 600px) {
  .n-menu-item-content-header {
    display: none;
  }
}

/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 600px) {
  .n-menu-item-content-header {
    display: inherit;
  }
}


</style>

<script lang="ts">
import { defineComponent,h  } from "vue"
import { syncedStore, getYjsValue, filterArray } from "@syncedstore/core"
import { WebrtcProvider } from "y-webrtc"
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from "y-indexeddb"
import { uuidv4 } from "lib0/random"
import * as awarenessProtocol from "y-protocols/awareness"
import {Doc} from 'yjs'
import { PeopleSettings20Filled, PersonSettings20Filled, People20Filled, Person20Filled} from '@vicons/fluent'
import{Initializer} from "./Initializer"
import { NIcon } from "naive-ui"
import {Md5} from 'ts-md5/dist/md5'

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
  email : string, 
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

const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', id, ydoc)

wsProvider.on('status', (event : any) => {
  console.log(event.status)
})

const awareness = wsProvider.awareness

const webrtcProvider = new WebrtcProvider(id, ydoc, {
                                              // see https://github.com/yjs/y-webrtc#user-content-api
                                              signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
                                              password: id.split("").reverse().join("!"),
                                              awareness: awareness,
                                              maxConns: 27 +  Math.floor(Math.random() * 15),
                                              filterBcConns: true,
                                              peerOpts: {}
                                            })


new IndexeddbPersistence(id, ydoc)

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

const defaultPage = 'team/vote'
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
      currentPageId : defaultPage,
      menuOptions : [
         {
            label: 'Team',
            key: defaultPage,
            icon: renderIcon(People20Filled)
         },
         {
            label: 'Me',
            key: '~/vote',
            icon: renderIcon(Person20Filled)
         },
         {
            label: 'Team Settings',
            key: 'team/settings',
            icon: renderIcon(PeopleSettings20Filled)
          },
          {
            label: 'My Settings',
            key: '~/settings',
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
      me = {name :'',email :'', createdAt : new Date().getTime(), icon : '', id : myID, online : true }
      users.push(me)
      // we have to search again to get the registered object. || me just keeps the compiler happy 
      return users.find(u => u.id == myID) || me
    },
  },

  watch : {
      "shared.jp.title" : function(val) {
        document.title = val
      },
      "myself.name" : function(val) {
        this.syncIcon()
      },
      "myself.email" : function(val) {
        this.syncIcon()
      }
  },

  methods: {

    syncIcon() {
       const hash = Md5.hashStr((this.myself.email || this.myself.name).trim().toLowerCase())
       this.myself.icon = 'http://www.gravatar.com/avatar/'+hash+'?d=monsterid'
    },

    handleUpdateValue (key : string, item: any) {
        window.location.hash = key
    },

    onHashChange() {
      const hash = window.location.hash.substring(1)
      if (this.pageIDs.includes(hash)) {
        this.currentPageId = hash
      } else {
        window.location.hash = ""
        this.currentPageId = defaultPage
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

new Initializer(
      ydoc,
      webrtcProvider, ()=>{ window.vm.init = true},
      111)
</script>
