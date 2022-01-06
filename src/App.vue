<template>
       <n-layout>
    <n-layout-header style="height: 48px;  line-height: 48px; padding: 2px 24px 2px 24px;" bordered>
          {{shared.jp.title ||'Joker Poker' }}   
      <n-tooltip trigger="hover">
    <template #trigger>
       <n-avatar
          round
          size="medium"
          v-on:click="navigate('~/settings')"
          style="float:right; margin-top: 5px; margin-left: 10px; cursor: pointer;"
          :src="myself.icon"/>
          
    </template>
    {{myself.name}}
  </n-tooltip>

 <n-icon v-if="wsConnected" size="45" style="float:right; margin-top: 0px;" color="#18a058">
   <wifi-120-regular/>
  </n-icon>
 <n-icon v-if="!wsConnected" size="45" style="float:right; margin-top: 0px;" color="#d03050">
   <wifi-off-20-regular/>
  </n-icon>


    </n-layout-header>
    <n-layout style="height: 100%;"  id="mainContent" has-sider>
       <n-layout-sider
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :native-scrollbar="false"
          style="max-height: 320px;"
        >
         <n-menu @update:value="navigate" mode="vertical" :options="navMenuOptions" v-model:value="currentPageId"
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
              <n-form-item label="Values">
                <n-input v-model:value="shared.jp.values" type="textarea" :rows="15"  placeholder="one value per line, lowest weigt first, ? has no weight" />
              </n-form-item>
              <n-button v-on:click="shared.jp.values = defaultValues" style="float:right; margin-right: 24px;"  :disabled="shared.jp.values == defaultValues">Reset default values</n-button>
              <pre>
                {{shared}}
              </pre>
            </div>
            <div v-if="currentPageId =='team/vote'">
                <n-list bordered>
                    <n-list-item  v-for="u in shared.users.filter(u => u.name )"  :key="u">
                      <template #prefix>
                        <n-button></n-button>
                      </template>
                      <template #suffix>
                        <n-avatar
                            round
                            size="medium"
                            :src="u.icon"/>
                      </template>
                       {{u.name}}
                    </n-list-item>
                  </n-list>
            </div>
            <div v-if="currentPageId =='~/vote'">
                <n-list>
                    <n-list-item  v-for="value in values"  :key="value">
                      <template #prefix>
                        <n-button class="jcard">{{value}}</n-button>
                      </template>
                    </n-list-item>
                  </n-list>
            </div>
            <div v-if="currentPageId =='~/settings'">
                <div v-if="init">
                   <n-form-item label="Name">
                    <n-input v-model:value="myself.name" type="text" placeholder="" /> 
                   </n-form-item>
                   <n-form-item label="Email">
                    <n-input v-model:value="myself.email" type="text" placeholder="" /> 
                   </n-form-item>
                     <n-switch v-model:value="myself.estimating">
                      <template #checked>I am participating in estimation</template>
                      <template #unchecked>I am observing</template>
                    </n-switch>
                </div>
            </div>
            <div v-if="currentPageId =='qr'">
               <n-image
                width="600"
                  :src="'https://target.baloise.ch/byod-api/rest/qr/600/'+sessionURL"
                            /> 
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
.jcard {
  min-width: 64px;
  min-height: 64px;
  font-weight: bold;
  box-shadow: 4px 4px 8px 0 rgba(0, 0, 0, 0.2), 6px 6px 20px 0 rgba(0, 0, 0, 0.19);
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
import { PeopleSettings20Filled, PersonSettings20Filled, People20Filled, Person20Filled, QrCode20Filled, Question20Filled, Wifi120Regular, WifiOff20Regular} from '@vicons/fluent'
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
  online: boolean,
  estimating: boolean
}
interface JokerPoker {
   title : string,
   values : string,
}

const store = syncedStore({ 
    jp : {} as JokerPoker,
    users : [] as User[]
  })


const ydoc = getYjsValue(store) as Doc

const wsProvider = new WebsocketProvider('wss://private-mango-chili.glitch.me', id, ydoc)
// const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', id, ydoc)

wsProvider.on('status', (event : any) => {
  console.log('WebsocketProvider',event.status)
  window.vm.wsConnected = 'connected' == event.status
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
new Initializer(
      ydoc,
      webrtcProvider, ()=>{ 
        window.vm.init = false
        window.vm.init = true
      },
      111)

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
    QrCode20Filled, 
    Question20Filled, 
    Wifi120Regular, 
    WifiOff20Regular,
    },

  data() {
    return {
      myID : myID,
      shared: store,
      init : false,
      currentPageId : defaultPage,
      defaultValues : "☕\n1\n2\n3\n5\n8\n13\n20\n40\n?",
      loadingUser : {name :'Loading',email :'', createdAt : new Date().getTime(), icon : 'tail-spin.svg', id : 'loading', online : false, estimating:false },
      wsConnected : false,
      sessionURL : window.location.href.split('#')[0],
      navMenuOptions : [
         {
            label: 'Team Vote',
            key: defaultPage,
            icon: renderIcon(People20Filled)
         },
         {
            label: 'My Vote',
            key: '~/vote',
            icon: renderIcon(Person20Filled)
         },
         {
            key: 'divider-1',
            type: 'divider',
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
          },
          {
            key: 'divider-2',
            type: 'divider',
          },
          {
            label: 'QR',
            key: 'qr',
            icon: renderIcon(QrCode20Filled)
          },
          {
            label: 'About',
            key: 'about',
            icon: renderIcon(Question20Filled)
          },
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
    values(): string[] {
      return (this.shared.jp.values || this.defaultValues).split("\n").map(v => v.trim())
    },
    pageIDs() : string[] {
      return this.navMenuOptions.map(o => o.key)
    },
    myself() : User {
      if(!this.init) return this.loadingUser
      var users = this.shared.users
      var me = users.find(u => u.id == myID)
      if(me) return me
      me = {name :'',email :'', createdAt : new Date().getTime(), icon : '', id : myID, online : true , estimating:true}
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
      },
  },

  methods: {

    syncIcon() {
       const hash = Md5.hashStr((this.myself.email || this.myself.name).trim().toLowerCase())
       this.myself.icon = 'http://www.gravatar.com/avatar/'+hash+'?d=monsterid'
    },

    navigate (key : string) {
        if('about' == key ){
          window.open('https://codeberg.org/culmat/joker-poker/src/branch/main/README.md', 'aboutJokerPoker')
          window.setTimeout(()=>{
            this.onHashChange()
          },5)
        } else {
          window.location.hash = key
        }
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


</script>
