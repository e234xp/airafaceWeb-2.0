import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from './en.json';
import zh from './zh.json';
import ja from './jp.json';
import es from './es.json';
import fr from './fr.json';
import th from './th.json';

Vue.use(VueI18n);

const language = 'en';
const locale = language;

const messages = {
  zh,
  en,
  ja,
  es,
  fr,
  th,
};

const i18n = new VueI18n({
  locale,
  messages,
});

i18n.formatter = {
  format: (message) => {
    const ret = i18n.messages[i18n.locale][message];
    return ret ?? `!${message}`;
    // if(ret) {
    //     return ret
    // } else {
    //     return message
    // }
  },
};

export default i18n;
