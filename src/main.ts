import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { plugin, defaultConfig } from '@formkit/vue'
import formKitConfig from '../formkit.config'
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';
import "./assets/theme.css";
import ConfirmationService from 'primevue/confirmationservice';


const app = createApp(App)


app.use(ConfirmationService);
app.use(createPinia())
app.use(PrimeVue)
app.use(plugin, defaultConfig(formKitConfig))
app.use(router)

app.mount('#app')
