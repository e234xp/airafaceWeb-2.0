try {
  const switchPage = (language) => {
    switch (language) {
      case 'zh-cn':
        console.log(`/zh-CN ${window.location.pathname}`);
        window.location.href = `/zh-CN ${window.location.pathname}`;
        return true;
      case 'en':
      case 'en-us':
        console.log(`/en-US ${window.location.pathname}`);
        window.location.href = `/en-US ${window.location.pathname}`;
        return true;
      case 'zh':
      case 'zh-tw':
        console.log(`/zh-TW ${window.location.pathname}`);
        window.location.href = `/zh-TW ${window.location.pathname}`;
        return true;
      default:
        return false;
    }
  };

  // detect window.navigator.languages
  let found = false;
  if (typeof (window.navigator.languages) === 'object') {
    Object.keys(window.navigator.languages).every((key, index) => {
      console.log(window.navigator.languages[index].toLowerCase());
      found = switchPage(window.navigator.languages[index].toLowerCase());
      if (found) {
        return false;
      }
      return true;
    });
  }

  if (!found) {
    const lang = window.navigator.userLanguage || window.navigator.language;
    const relang = lang.toLowerCase();
    found = switchPage(relang);
  }

  if (!found) {
    window.location.href = `/en-US ${window.location.pathname}`;
  }
} catch (e) {
  window.location.href = `/en-US ${window.location.pathname}`;
}
