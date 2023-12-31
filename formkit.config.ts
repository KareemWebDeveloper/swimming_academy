import "@formkit/themes/genesis"
import { genesisIcons } from "@formkit/icons"
import type { DefaultConfigOptions ,} from '@formkit/vue'
import { createProPlugin, inputs } from '@formkit/pro'
import '@formkit/pro/genesis'
import { ar } from '@formkit/i18n'
// import SubmitLoading from '../inputs/SubmitLoading.vue'

const pro = createProPlugin(import.meta.env.VITE_FORMKIT_TOKEN, inputs)




const config: DefaultConfigOptions = {
    plugins: [pro],
    icons: { ...genesisIcons },
    locales: { ar },
    locale: 'ar',
}

export default config
