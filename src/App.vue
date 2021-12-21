<template>

         

       <n-layout style="height: 360px;">
    <n-layout-header style="height: 64px; padding: 24px;" bordered
      >Yiheyuan Road</n-layout-header
    >
    <n-layout position="absolute" style="top: 64px;">
      <n-layout content-style="padding: 24px;" :native-scrollbar="false">
         <pre>
            {{shared}}
          </pre> 
          <p
                v-for="u in shared.users"
                :key="u"
              >{{u.name}}
              </p>      
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

const urlTokens = document.URL.split('/~/');
var id : string;
if(urlTokens.length > 1 && urlTokens[1].length >0) {
  id = urlTokens[1].split('#')[0];
} else {
  id = uuidv4()
  window.history.pushState({ }, '', urlTokens[0]+'~/'+ id);
}


interface Indentified {id:string}
interface User extends Indentified { name: string; createdAt: Date; icon: string }

const store = syncedStore({ 
    users : [] as User[]
  });

const doc = getYjsValue(store) as any;
const webrtcProvider = new WebrtcProvider(id, doc);
new IndexeddbPersistence(id, doc);

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
    document.title = "Joker Poker"
  },
  
  // computed properties
  // http://vuejs.org/guide/computed.html
  computed: {
    foo() {
      return 'foo';
    },
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    pluralize(n: number) {
      return n === 1 ? "item" : "items";
    },
    addUser(name : string) {
      this.shared.users.push({
        name: name,
        id : myID,
        createdAt : new Date(),
        icon : ''
      });
    },
    removeUser(id: string) {
        filterArray(this.shared.users, (u) => u.id != id);
    },
  },
});
</script>
