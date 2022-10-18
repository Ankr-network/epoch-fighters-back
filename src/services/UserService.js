const repository = require("../repositories/UsersRepository");
const cryptoUtils = require('../utils/crypto');
const {v4: uuid} = require('uuid');
const {DateTime} = require("luxon");
const CodedError = require('../utils/CodedError');

class UserService {
  async getUser(addr) {
    const user = await repository.getUserByAddress(addr);
    return this.mapUser(user);
  }

  async addAmount(token, amount) {
    const user = await repository.getUserByToken(token);
    const newAmount = user.amount + amount;
    if (newAmount >= 0) {
      const user = await repository.updateAmount(token, newAmount);
      return this.mapUser(user);
    } else {
      throw new CodedError(500, "Insufficient funds");
    }
  }

  async createOrUpdateUser(loginData) {
    const {address, message, signature} = loginData;
    if (cryptoUtils.checkAddress(address, message, signature)) {
      const existedUser = await repository.getUserByAddress(address);
      const token = this.createToken();
      const expireAt = DateTime.now().plus({months: 1}).toISO();
      if (existedUser) {
        await repository.updateToken(address, token, expireAt);
      } else {
        const newUserData = {
          address,
          token,
          expireAt
        };
        await repository.addUser(newUserData);
      }
      return token;
    } else {
      throw new CodedError(500, "Inappropriate address");
    }
  }

  removeToken(token) {
    const user = repository.getUserByToken(token);
    if(user) {
      repository.updateToken(user.address, null, null);
    }
  }

  async getAuthorizeStatus(address, hmac) {
    const user = await repository.getUserByAddress(address);
    const derivedHmac = await cryptoUtils.DeriveHmac(address, user.token);
    console.log(hmac.toLowerCase(), derivedHmac.toLowerCase())
    return !!user && hmac.toLowerCase() === derivedHmac.toLowerCase() && DateTime.fromISO(user.expireAt) > DateTime.now();
  }

  async tokenIsActive(token) {
    const user = await repository.getUserByToken(token);
    return !!user && DateTime.fromISO(user.expireAt) > DateTime.now();
  }

  createToken() {
    return uuid();
  }

  mapUser(user) {
    const {id, address, rate, amount} = user;
    return {id, address, rate, amount};
  }
}

module.exports = new UserService();
