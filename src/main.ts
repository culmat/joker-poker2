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
  NInput,
  NImage,
  NMenu,
  NIcon,
  NCard,
  NFormItem,
  NAvatar,
  NTooltip
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
    NInput,
    NImage,
    NMenu,
    NIcon,
    NCard,
    NFormItem ,
    NAvatar,
    NTooltip  
  ]
}))
export const vm = app.mount("#app") as any


declare global {
  interface Window {
      vm:any
  }
}
window.vm = vm

