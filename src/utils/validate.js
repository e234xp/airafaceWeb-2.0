function getIsFieldPassedFunction({ customValidators, rules }) {
  const validators = {
    nonEmpty: (value) => value.length > 0,
    port: (value) => value >= 0 && value <= 65535,
    password: (value) => value.length >= 0,
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

export { getIsFieldPassedFunction };
