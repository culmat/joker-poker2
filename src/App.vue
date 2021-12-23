<template>

         

       <n-layout style="height: 660px;">
    <n-layout-header style="height: 64px; padding: 24px;" bordered
      > {{shared.jp.title}}</n-layout-header
    >
    <n-layout position="absolute" style="top: 64px;">
      <n-layout content-style="padding: 24px;" :native-scrollbar="false">
         <pre>
            {{shared}}
          </pre> 
          <p
                v-for="u in shared.jp.users"
                :key="u"
              >{{u.name}}
              </p>
              <n-input v-model:value="shared.jp.title" type="text" placeholder="Title" />     
          <n-button>naive-ui</n-button> 
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
import { defineComponent } from "vue";
import { syncedStore, getYjsValue, filterArray } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { uuidv4 } from "lib0/random";
import * as awarenessProtocol from "y-protocols/awareness";

const urlTokens = document.URL.split('/~/');
var id : string;
if(urlTokens.length > 1 && urlTokens[1].length >0) {
  id = urlTokens[1].split('#')[0];
} else {
  id = uuidv4()
  window.history.pushState({ }, '', urlTokens[0]+'~/'+ id);
}


interface Indentified {id:string}
interface User extends Indentified { name: string; createdAt: number; icon: string }
type JokerPoker = {
   title : string,
   users : User[]
}

const store = syncedStore({ 
    jp : {} as JokerPoker
  });


const ydoc = getYjsValue(store) as any;
var busyStart = 0;
ydoc.on('beforeAllTransactions', () => {
  console.log("ydoc busy");
  busyStart = new Date().getTime();
  });
ydoc.on('afterAllTransactions', () => {
  console.log("ydoc calm after", new Date().getTime() - busyStart);
});

const webrtcProvider = new WebrtcProvider(id, ydoc, {
  // see https://github.com/yjs/y-webrtc#user-content-api
  signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com', 'wss://y-webrtc-signaling-us.herokuapp.com'],
  password: id.split("").reverse().join("!"),
  awareness: new awarenessProtocol.Awareness(ydoc),
  maxConns: 27 +  Math.floor(Math.random() * 15),
  filterBcConns: true,
  peerOpts: {}
});

new IndexeddbPersistence(id, ydoc);

// All of our network providers implement the awareness crdt
const awareness = webrtcProvider.awareness;
console.log("clientID", awareness.clientID);

// You can observe when a user updates their awareness information
awareness.on("change", (changes: any) => {
  // Whenever somebody updates their awareness information,
  // we log all awareness information from all users.
  console.log(changes);
  const awarenesStates = Array.from(awareness.getStates().values()) as Indentified[];
  console.log(awarenesStates);
});

var myID = localStorage.getItem(id) as string;
if(!myID) {
  myID = uuidv4();
  localStorage.setItem(id,myID);
  //myself = { id:uuidv4(), name: '', createdAt: new Date(), icon: '' };
}
console.log("awareness.getLocalState", awareness.getLocalState());

// You can think of your own awareness information as a key-value store.
// We update our "user" field to propagate relevant user information.
awareness.setLocalState({id: myID});

export default defineComponent({
  data() {
    return {
      shared: store
    };
  },

  created(){ 
    this.init();
  },
  
  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {

    myself() : User {
      var users = this.getUsers();
      var me = users.find(u => u.id == myID);
      if(!me){
        me = {name :'', createdAt : new Date().getTime(), icon : '', id : myID };
        users.push(me);
      }
      return me;
    },
  },

  watch : {
      "shared.jp.title" : function(val) {
        this.shared.jp.title = val;
        document.title = val;
      }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    init(){
      
      if(webrtcProvider.connected) {
        console.log("init");
        //call myself() to register me
        console.log(this.myself);
        if(!store.jp.title) store.jp.title = "Joker Poker"

      } else {
        window.setTimeout(this.init, 111);

      }
    },

    getUsers() : User[] {
      if (!this.shared.jp.users) this.shared.jp.users = []
      return this.shared.jp.users;
    },

    removeUser(id: string) {
        filterArray(this.getUsers(), (u) => u.id != id);
    },
  },
});
</script>
