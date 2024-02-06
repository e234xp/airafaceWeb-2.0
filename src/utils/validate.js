import i18n from '@/i18n';

function getIsFieldPassedFunction({ customValidators, rules }) {
  const validators = {
    nonEmpty: (value) => value.length > 0,
    port: (value) => value > 0 && value <= 65535,
    password: (value) => value.length > 0,
    passitiveInt: (value) => /^\d+$/.test(value),
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
  const re = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
  return re.test(str) ? '' : i18n.formatter.format('InvalidEmailFormat');
}

function checkPort(str) {
  if (str === '') return i18n.formatter.format('NoEmptyNoSpace');
  const re = /^\d+$/;
  if (!re.test(str)) return i18n.formatter.format('NoEmptyPortOnly');
  if (str < 1 || str > 65535) return i18n.formatter.format('NoEmptyPortOnly');
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
  return re.test(str) ? '' : i18n.formatter.format('InvalidIPAddressFormat');
}

function checkDelay(value) {
  if (value < 1 || value > 30) {
    return i18n.formatter.format('disp_limitNumber1to30');
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
