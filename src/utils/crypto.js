const Web3 = require("web3");
const abi = require("../../assets/epoch-abi.json");
const crypto = require("crypto");
const EventDecoder = require("../utils/EventDecoder");

const RPC_NODE_URL = process.env.RPC_NODE_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONNECTED_LIFECICLE_EVENT = "connected";
const RECEIVED_LIFECICLE_EVENT = "data";
const ERROR_LIFECICLE_EVENT = "error";

class Crypto
{
  constructor() {
    this.web3 = new Web3(RPC_NODE_URL);
    this.contract = new this.web3.eth.Contract(abi, CONTRACT_ADDRESS);
    this.logDecoders = this.getDecoders();
    console.log(this.logDecoders);
  }

  checkAddress(address, message, signature) {
    return this.recoverAddress(message, signature).toLowerCase() === address.toLowerCase();
  }

  recoverAddress(message, signature) {
    return this.web3.eth.accounts.recover(message, signature);
  }

  hexToBytes(hex) {
    return this.web3.utils.hexToBytes(hex);
  };

  bytesToHex(bytes) {
    return this.web3.utils.bytesToHex(bytes);
  }

  getPastEvents(eventName, fromBlock) {
    return this.contract.getPastEvents(eventName, {
      fromBlock: fromBlock,
      toBlock: "latest"
    });
  }

  subscribeToEvents(eventName, fromBlock, eventHandler) {
    const subscribeToEvent = this.contract.events[eventName];
    return new Promise((resolve, reject) => {
      subscribeToEvent({fromBlock})
        .on(CONNECTED_LIFECICLE_EVENT, (subscriptionId) => {
          resolve(subscriptionId);
        })
        .on(RECEIVED_LIFECICLE_EVENT, (even) => {
          eventHandler(even);
        })
        .on(ERROR_LIFECICLE_EVENT, function(error) {
          reject(error);
        });
    });
  }

  unsubscribeAll() {
    this.web3.eth.clearSubscriptions();
  }

  async getLogsByHash(hash) {
    const receipt = await this.web3.eth.getTransactionReceipt(hash);
    if(!receipt) {
      throw new Error(`There is no transaction with hash ${hash}`);
    }
    if(!receipt.logs) {
      throw new Error(`Transaction with hash ${hash} has not any logs`);
    }
    try {
      return receipt.logs.map(log => this.parseLog(log));
    } catch (e) {
      console.log(e);
    }
  }

  getDecoders() {
    return abi
      .filter(json => json.type === 'event')
      .map(json => new EventDecoder(json));
  }

  parseLog(log) {
    const decoder = this.findDecoder(log);
    if(!decoder) {
      console.log(`Decoder for ${log.topics[0]} didn't find`);
      return null;
    }
    return decoder.decode(log);
  }

  findDecoder(log) {
    return this.logDecoders.find(decoder => decoder.signature === log.topics[0]);
  }

  async DeriveHmac(message, secret) {
    const enc = new TextEncoder("utf-8");
    const algorithm = { name: "HMAC", hash: "SHA-256" };
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      algorithm,
      false, ["sign", "verify"]
    );
    const hashBuffer = await crypto.subtle.sign(
      algorithm.name,
      key,
      enc.encode(message)
    );
    const hash = Array.from(new Uint8Array(hashBuffer));
    return this.bytesToHex(hash);
  }
}

module.exports = new Crypto();
