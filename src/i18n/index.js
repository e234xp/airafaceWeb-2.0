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

//message is key , i18n.messages[i18n.locale][message] 該語系 =>所以會是該語系的某個key的value
i18n.formatter = {
    format: (message, ...values) => {
        let ret = i18n.messages[i18n.locale][message];
        return ret ?? "!" + message;
        // if(ret) {
        //     return ret
        // } else {
        //     return message
        // }
    }
}



export default i18n
