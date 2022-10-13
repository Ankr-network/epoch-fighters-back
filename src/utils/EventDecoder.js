const Web3 = require("web3");

const eth = new Web3().eth;

class EventDecoder {
  constructor(jsonEvent) {
    this.name = jsonEvent.name;
    this.inputs = jsonEvent.inputs;
    this.signature = eth.abi.encodeEventSignature(jsonEvent);
  }

  decode(log) {
    const topicsWithoutName = log.topics.splice(-log.topics.length + 1);
    return {
      name: this.name,
      values: eth.abi.decodeLog(this.inputs, log.data, topicsWithoutName)
    };
  }
}

module.exports = EventDecoder
