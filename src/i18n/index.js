import Vue from 'vue'
import VueI18n from 'vue-i18n'

import en from './en.json';
import zh from './zh.json';
import ja from './jp.json';
Vue.use(VueI18n);

let language = 'en';
const locale = language;

const messages = {
    zh,
    en,
    ja
}

const i18n = new VueI18n({
    locale,
    messages
})

i18n.formatter = {
 format: (message, ...values) => {
    return i18n.messages[i18n.locale][message]
 }
}

export default i18n
