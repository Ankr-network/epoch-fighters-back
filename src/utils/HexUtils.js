const BigNumber = require("bignumber.js");

const hexToNumber = (hex) => {
  return new BigNumber(hex, 16).toString(10);
}

const numberToHex = (number) => {
  return new BigNumber(number).toString(16);
}

module.exports = {
  hexToNumber,
  numberToHex
}
