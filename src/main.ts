import * as Vue from "vue"
import App from "./App.vue"
import { enableVueBindings } from "@syncedstore/core"
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import {
  create,
  // components
  NButton,
  NLayout,
  NLayoutHeader,
  NLayoutFooter,
  NLayoutSider,
  NH2,
  NInput
} from 'naive-ui'


// make SyncedStore use Vuejs internally
enableVueBindings(Vue)

const app = Vue.createApp(App)
app.use(create({
  components: [
    NButton,
    NLayout,
    NLayoutHeader,
    NLayoutFooter,
    NLayoutSider,
    NH2,
    NInput
  ]
}))
export const vm = app.mount("#app") as any

function onHashChange() {
  const visibility = window.location.hash.replace(/#\/?/, "")
  if (["all", "active", "completed"].includes(visibility)) {
    vm.visibility = visibility
  } else {
    window.location.hash = ""
    vm.visibility = "all"
  }
}

declare global {
  interface Window {
      vm:any
  }
}
window.vm = vm

//window.addEventListener("hashchange", onHashChange)
//onHashChange()
