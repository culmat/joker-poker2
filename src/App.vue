<template>
       <n-layout>
    <n-layout-header style="height: 48px;  line-height: 48px; padding: 2px 24px 2px 24px;" bordered>
         <n-h1>
           <n-gradient-text type="primary">
           {{title}}
             </n-gradient-text> 
      <n-tooltip trigger="hover" placement="bottom-end">
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


           </n-h1> 
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
          :collapsed="collapsed"
          @update:collapsed="onCollapsed"
        >
         <n-menu @update:value="navigate" mode="vertical" :options="navMenuOptions" v-model:value="currentPageId"
            :collapsed-width="64"
            :collapsed-icon-size="22"
          />
        </n-layout-sider>

      <n-layout :style="insetStyle" >
        <n-card v-if="!initialised">
             Loading<br/><br/>
             <n-spin size="large" />
        </n-card>
        <n-card v-if="initialised">
            <div v-if="currentPageId =='team/estimate'">
                <div v-if="mateCount">
                    <n-list>
                        <n-list-item  v-for="u in estimatingUsers"  :key="u">
                          <template #prefix>
                            <n-button class="jcard" :disabled="u.id != myID" v-on:click="navigate('~/estimate')" :type="getType(u.estimate)">
                                  <div v-if="u.id == myID || estimateDone" style="font-weight: bolder;">
                                    {{u.estimate}}
                                  </div>
                                  <n-icon v-if="u.estimate && u.id != myID && !estimateDone">
                                    <checkmark-12-filled/>
                                  </n-icon>
                            </n-button>
                          </template>
                          <template #suffix>
                            <n-avatar
                                round
                                size="medium"
                                :src="u.icon"/>
                          </template>
                          <n-button text v-if="u.id == myID" v-on:click="navigate('~/estimate')" style="font-weight: bolder;">
                              {{u.name}}
                          </n-button>
                          <div v-if="u.id != myID">
                              {{u.name}}
                          </div>
                        </n-list-item>
                      </n-list>
                      <n-button v-on:click="reset()" class="rightAligned" :disabled="!estimateDone">
                        <n-icon style="margin-right: 6px;">
                              <arrow-reset-20-filled/>
                                  </n-icon>
                        Reset</n-button>
                      <n-button v-on:click="reveal()" class="rightAligned" :disabled="estimateDone">
                        <n-icon style="margin-right: 6px;">
                              <checkmark-12-filled/>
                                  </n-icon>
                        Reveal
                        </n-button>
                    </div>
                    <div v-if="!mateCount"> 
                        You seem to be the first around here.<br/><br/>
                         <n-button type="primary" v-on:click="navigate('qr')">
                            <template #icon>
                              <n-icon>
                                <qr-code-20-filled/>
                              </n-icon>
                            </template>
                            Invite some mates
                         </n-button>
                    </div>
            </div>
            <div v-if="currentPageId =='~/estimate'">
                <n-list v-if="myself.estimating">
                    <n-list-item  v-for="value in values"  :key="value">
                      <template #prefix>
                        <n-button class="jcard" v-on:click="myself.estimate=value; navigate('team/estimate');"  strong="true">{{value}}</n-button>
                      </template>
                    </n-list-item>
                  </n-list>
                  <div v-if="!myself.estimating">
                    As observer you do not figure in the list of team mates and thus can not cast an estimate.<br/><br/>
                    <n-switch v-model:value="myself.estimating">
                      <template #checked>I am participating in estimation</template>
                      <template #unchecked>I am observing</template>
                    </n-switch>
                  </div>
            </div>
          <div v-if="currentPageId =='team/settings'">
            <n-form>
              <n-form-item label="Name">
                <n-input @keypress.enter="autoNavigate()" v-model:value="shared.jp.title" type="text" placeholder="Joker Poker" />
              </n-form-item>
              <n-form-item label="Mates">
                <n-list bordered style="width: 100%;">
                  <n-list-item  v-for="u in namedUsers"  :key="u">
                        <template #prefix>
                          <n-avatar
                              round
                              size="medium"
                              :src="u.icon"/>
                        </template>
                        <span :style="u.id == myself.id? 'min-width: 88px; display: inline-block; font-weight:bolder;' : 'min-width: 88px; display: inline-block;'">{{u.name}}</span>
                          <n-switch v-model:value="u.estimating" style="margin-left: 12px;">
                            <template #checked>Estimate</template>
                            <template #unchecked>Observe</template>
                          </n-switch>
                           <template #suffix>
                            <n-icon v-if="u.online" size="24" style="margin-left: 12px; margin-top: 12px;" color="#18a058">
                              <wifi-120-regular/>
                              </n-icon>
                            <n-icon v-if="!u.online" size="24" style="margin-left: 12px; margin-top: 12px;" color="#d03050">
                              <wifi-off-20-regular/>
                              </n-icon>
                           </template>
                      </n-list-item>
                </n-list>
              </n-form-item>
              <n-form-item label="Values">
                <n-input v-model:value="shared.jp.values" type="textarea" :rows="values.length"  placeholder="one value per line, lowest weigt first, ? has no weight" />
              </n-form-item>
              <n-button v-on:click="shared.jp.values = defaultValues" class="rightAligned" :disabled="shared.jp.values == defaultValues">
                <n-icon style="margin-right: 6px;">
                              <arrow-reset-20-filled/>
                                  </n-icon>
                Reset default values
                </n-button>
            </n-form>
            </div>
            <div v-if="currentPageId =='~/settings'">
            <n-form >
                   <n-form-item label="Name">
                    <n-input @keypress.enter="autoNavigate()"
                    v-model:value="myself.name" type="text" :placeholder="myself.estimating? 'Please enter your name' : ''" :autofocus="true"/> 
                   </n-form-item>
                   <n-form-item label="Email">
                    <n-input @keypress.enter="autoNavigate()" v-model:value="myself.email" type="text" placeholder="" /> 
                   </n-form-item>
                     <n-switch v-model:value="myself.estimating">
                      <template #checked>I am participating in estimation</template>
                      <template #unchecked>I am observing</template>
                      </n-switch>
              </n-form>
            </div>
            <div v-if="currentPageId =='qr'" style="width:100%; text-align: center; display:inline-block">
               <n-image style="width:100%; text-align: center; display:inline-block"
                  :src="'https://target.baloise.ch/byod-api/rest/qr/600/'+sessionURL"
                            /> <br/>
                            You have {{mateCount}} mates.<br/>
                            <n-a :href="sessionURL">{{sessionURL}}</n-a>
                             <n-tooltip trigger="hover" placement="top">
                                <template #trigger>
                                    <n-button v-on:click="copyToClipBoard(sessionURL)" style="margin-left: 12px;">
                                    <template #icon>
                                      <n-icon>
                                        <copy-16-regular/>
                                      </n-icon>
                                    </template>
                                </n-button>
                              </template>
                              Copy to clipboard
                             </n-tooltip>
            </div>
          </n-card> 
      </n-layout>
    </n-layout>
  </n-layout>
  <input type="text" value="" id="clipTmp" hidden/>
</template>

<style>
.n-layout-header{
  color: #18a058;
  background: linear-gradient(90deg, white 0%, #e7f5ee 100%);
  border-bottom: 1px solid #18a058 !important;
}
.jcard {
  min-width: 46px;
  min-height: 54px;
  box-shadow: 4px 4px 8px 0 rgba(0, 0, 0, 0.2), 6px 6px 20px 0 rgba(0, 0, 0, 0.19);
}
.rightAligned {
  float:right; margin-left: 12px;
}
.n-avatar {
  filter: drop-shadow(1px 2px 1px #18a058);
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
import { PeopleSettings20Filled, PersonSettings20Filled, People20Filled, Person20Filled, QrCode20Filled, Question20Filled, Wifi120Regular, WifiOff20Regular, Checkmark12Filled, Copy16Regular, ArrowReset20Filled} from '@vicons/fluent'
import{Initializer} from "./Initializer"
import { NIcon } from "naive-ui"
import {Md5} from 'ts-md5/dist/md5'
import Cookies from 'js-cookie'


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
  estimating: boolean,
  estimate: string
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
  window.vm.wsConnected = 'connected' == event.status
})

const awareness = wsProvider.awareness

new WebrtcProvider(id, ydoc, {
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
        wsProvider, ()=>{ 
          window.vm.initialised = true
        },
        111)

var myID = localStorage.getItem(id) as string
if(!myID) {
  myID = uuidv4()
  localStorage.setItem(id,myID)
}
var myName = Cookies.get('myName') || ''
var myEmail = Cookies.get('myEmail') || ''

awareness.setLocalState({id: myID} as Indentified)

function renderIcon (icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const defaultPage = 'team/estimate'
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
    Checkmark12Filled,
    Copy16Regular,
    ArrowReset20Filled
    },

  data() {
    return {
      myID : myID,
      shared: store,
      collapsed : this.isSmall(window.innerWidth),
      initialised : false,
      currentPageId : defaultPage,
      defaultValues : "☕\n1\n2\n3\n5\n8\n13\n20\n40\n?",
      loadingUser : {name :'Loading',email :'', createdAt : new Date().getTime(), icon : 'tail-spin.svg', id : 'loading', online : false, estimating:false, estimate : '' },
      wsConnected : false,
      sessionURL : window.location.href.split('#')[0],
      navMenuOptions : [
         {
            label: 'Team Estimate',
            key: defaultPage,
            icon: renderIcon(People20Filled)
         },
         {
            label: 'My Estimate',
            key: '~/estimate',
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
      this.syncAwareness()
    })
  },

  computed: {

    insetStyle() : string {
      return  this.$windowWidth > 600 ? "padding: 24px; background-color: #fafafc;" : "padding: 0px; background-color: white;"
    },
    
    title() : string {return this.shared.jp.title ||'Joker Poker'},

    isSmallScreen() : boolean {
      return this.isSmall(this.$windowWidth) 
    },

    values(): string[] {
      return (this.shared.jp.values || this.defaultValues).split("\n").map(v => v.trim())
    },
    valuesWithoutQuestionmark(): string[] {
      return this.values.filter(v=> v != '?')
    },
    pageIDs() : string[] {
      return this.navMenuOptions.map(o => o.key)
    },
    myself() : User {
      if(!this.initialised) return this.loadingUser
      var users = this.shared.users
      var me = users.find(u => u.id == myID)
      if(me) return me
      me = {name :'',email :'', createdAt : new Date().getTime(), icon : '', id : myID, online : true , estimating:true, estimate : ''}
      users.push(me)
      // we have to search again to get the registered object. || me just keeps the compiler happy 
      return users.find(u => u.id == myID) || me
    },
    namedUsers(): User[] {
      return this.shared.users.filter(u => u.name)
    },
    estimatingUsers(): User[] {
      return this.namedUsers.filter(u => u.online && u.estimating )
    },
    mateCount(): number {
      return Math.max(0, this.estimatingUsers.length - (this.myself.estimating?1:0))
    },
    estimates(): string[] {
      return this.estimatingUsers.map(u => u.estimate)
    },
    estimateCount() : number {
      return this.estimatingUsers.filter(u=>u.estimate).length
    },
    estimateProgress(): number {
      return 100 * this.estimateCount / this.estimatingUsers.length;
    },
    estimateDone() : boolean {
      return 100 == this.estimateProgress;
    },
    estimateLow() : string | undefined {
      return this.valuesWithoutQuestionmark.find(v=> this.estimates.includes(v))
    },
    estimateHeigh() : string | undefined {
      return this.valuesWithoutQuestionmark.slice().reverse().find(v=> this.estimates.includes(v))
    },
  },

  watch : {
      "shared.jp.title" : function(val) {
        document.title = val
      },
        "myself" : function(val) {
          this.syncAwareness()
      },
      "myself.name" : function(val) {
        this.syncIcon()
        Cookies.set('myName', val, { expires: 777})
      },
      "myself.email" : function(val) {
        this.syncIcon()
        Cookies.set('myEmail', val, { expires: 777 })
      },
      estimateCount(val) {
        if(val == 0 && this.myself.estimating && !this.currentPageId.endsWith('settings')) this.navigate('~/estimate') 
      },
      estimateDone(val) {
        if(val && !this.currentPageId.endsWith('settings')) this.navigate('team/estimate') 
      },
      initialised(val) {
        if(val) {
          if(!this.myself.name) {
            this.myself.name = myName ||''
            this.myself.email = myEmail ||''
          }
          this.autoNavigate()
        }
        document.title = this.title
      },
      isSmallScreen(val) {
        this.collapsed = val
      },
  },

  methods: {

  isSmall(width :number):boolean {
    return width < 600
  },
  
  copyToClipBoard(text: string) {
		var copyText = (document.getElementById('clipTmp') || document.body) as HTMLInputElement
		copyText.value= text
		copyText.select()
		copyText.setSelectionRange(0, 99999); /* For mobile devices */
		navigator.clipboard.writeText(copyText.value)
  },
  
  onCollapsed(collapsed : boolean) {
     this.collapsed = collapsed
   },
  syncIcon() {
       const hash = Md5.hashStr((this.myself.email || this.myself.name).trim().toLowerCase())
       this.myself.icon = 'http://www.gravatar.com/avatar/'+hash+'?d=monsterid'
    },
    
    getType(estimate : string) : string {
      if(!this.estimateDone) return ''
      if(estimate == '?') return ''
      if(this.estimateLow == this.estimateHeigh) return 'success'
      if(this.estimateLow == estimate) return 'error'
      if(this.estimateHeigh == estimate) return 'warning'
      return ''
    },

    reset() {
      this.shared.users.forEach(u=>u.estimate = '')
    },
    
    reveal() {
      this.shared.users.forEach(u=>u.estimate = u.estimate || '?')
    },

    autoNavigate () {
      if      (!this.myself.name)   this.navigate('~/settings')
      else if (!this.mateCount)     this.navigate('qr')
      else if (this.myself.estimating && 
              !this.estimateDone)   this.navigate('~/estimate')
      else                          this.navigate('team/estimate')
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
        if(this.isSmallScreen) this.collapsed = true
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
        u.online = awarenesStates.find(i => i.id == u.id) != undefined
      })
    },
  },
})


</script>
