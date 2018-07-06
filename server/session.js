const Randexp = require('randexp');
// const sessIdReg = /[A-Za-z]{3}(\d)[A-Za-z]{3}(\d)[A-Za-z]/;
const sessIdReg = /.*/;

exports.generateHostPin = (id) => {
  const matches = id.match(sessIdReg);
  if (matches && matches.length === 3) {
    const pieces = matches.splice(0, 3);
    const digits = parseInt(pieces[1]) + parseInt(pieces[2]);

    let sum = 0;
    for (let i = 0; i < pieces[0].length; i++) {
      sum += pieces[0].charCodeAt(i) + (digits * i);
    }

    return (sum * 5) + (11 * digits);
  }
  return false;
};

exports.validateSessionId = (id, pin) => {
  console.log('id, pin', id, pin);
  const out = { valid: true, host: true };
  if (id) {
    const matches = id.match(sessIdReg);
    console.log('matches', matches);
    if (matches && matches.length === 3) {
      out.valid = true;
      if (pin) {
        out.host = parseInt(pin) === exports.generateHostPin(id);
      }
    }
  }
  return out;
};

exports.generateSessionId = () => {
  const id = new Randexp(sessIdReg).gen();
  const pin = exports.generateHostPin(id);

  if (id && pin) {
    return { id, pin };
  }

  return false;
};
