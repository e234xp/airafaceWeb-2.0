import Vue from 'vue';
import VueI18n from 'vue-i18n';

import en from './en.json';
import zh from './zh.json';
import ja from './jp.json';
import es from './es.json';
import fr from './fr.json';
import th from './th.json';
import vi from './vi.json';
import id from './id.json';
import tr from './tr.json';
import ko from './ko.json';
import pt from './pt.json';

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
  vi,
  id,
  tr,
  ko,
  pt,
};

// const i18n = new VueI18n({
//   locale,
//   messages,
// });

// i18n.formatter = {
//   format: (message) => {
//     const ret = i18n.messages[i18n.locale][message];
//     return ret ?? `!${message}`;
//     // if(ret) {
//     //     return ret
//     // } else {
//     //     return message
//     // }
//   },
// };
const i18n = new VueI18n({
  locale,
  messages,
  missing: (_locale, key) => `!${key}`,
});

// 保留 vue-i18n 原本的 formatter.interpolate()
// 只增加舊程式需要的 format()
i18n.formatter.format = (message) => {
  const ret = messages[i18n.locale]?.[message];
  return ret ?? `!${message}`;
};

export default i18n;
