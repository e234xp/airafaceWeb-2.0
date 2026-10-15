import i18n from '@/i18n';

function getIsFieldPassedFunction({ customValidators, rules }) {
  const validators = {
    nonEmpty: (value) => value.length > 0,
    port: (value) => value > 0 && value <= 65535,
    password: (value) => value.length > 0,
    passitiveInt: (value) => /^\d+$/.test(value),
    ipv4: (value) => checkIpAddr(`${value}`) === '',
    ...customValidators,
  };

  return (fieldName, fieldValue) => {
    const rule = rules[fieldName];

    if (!rule) {
      return true;
    }

    const validator = validators[rule];
    if (!validator) {
      return false;
    }

    return validator(fieldValue);
  };
}

function checkDomainName(str) {
  if (str === '') return i18n.formatter.format('NoEmptyNoSpace');
  // IP（IPv4）或 DNS 名稱
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(str);
  if (ipv4) return ipv4.slice(1).every((n) => Number(n) <= 255) ? '' : i18n.formatter.format('InvalidEmailFormat');
  const re = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
  return re.test(str) ? '' : i18n.formatter.format('InvalidEmailFormat');
}

function checkPort(str, min = 1) {
  if (str === '') return i18n.formatter.format('NoEmptyNoSpace');
  const re = /^\d+$/;
  if (!re.test(str)) return i18n.formatter.format('NoEmptyPortOnly');
  if (str < min || str > 65535) return i18n.formatter.format('NoEmptyPortOnly');
  return '';
}

function checkEmail(str) {
  if (str === '') return i18n.formatter.format('NoEmptyNoSpace');
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(str) ? '' : i18n.formatter.format('InvalidEmailFormat');
}

function checkMultiEmail(str) {
  if (str === '') return i18n.formatter.format('NoEmptyNoSpace');
  const re = /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}(?:,[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,})*$/;
  return re.test(str) ? '' : i18n.formatter.format('InvalidEmailFormat');
}

function checkIpAddr(str) {
  if (str === '') return i18n.formatter.format('NoEmptyNoSpace');
  const re = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!re.test(str) || str.split('.').some((n) => Number(n) > 255)) return i18n.formatter.format('InvalidIPAddressFormat');
  return '';
}

function checkDelay(value) {
  if (value < 1 || value > 30) {
    return i18n.formatter.format('limitNumbers1to30');
  }
  return '';
}

export {
  getIsFieldPassedFunction,
  checkDomainName,
  checkPort,
  checkEmail,
  checkMultiEmail,
  checkIpAddr,
  checkDelay,
};
