const ethers = require('ethers');
const userRepository = require("../repositories/UsersRepository");
const heroRepository = require("../repositories/HeroesRepository");
const heroNftMapper = require("../utils/hero-nft-mapper");
const CodedError = require('../utils/CodedError');

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const RPC_NODE_URL = process.env.RPC_NODE_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CHAIN_ID = process.env.CHAIN_ID;
const SIGNING_DOMAIN_NAME = "Epoch"
const SIGNING_DOMAIN_VERSION = "1"

class NftService {
  constructor() {
    this.provider = this.getProvider();
    this.signer = this.getSigner(this.provider);
  }

  async getSignedHeroNFT(heroId, token) {
    const user = await userRepository.getUserByToken(token);
    const hero = await heroRepository.getHeroById(heroId);

    // if(hero.userId.equals(user._id)) {
      const heroNftVoucher = heroNftMapper(hero);
      console.log(heroNftVoucher);
      return this.signData(heroNftVoucher);
    // } else {
    //   throw new CodedError(401, `Fighter ${hero.name} doesn't belong to your account`);
    // }
  }

  async signData(heroNftVoucher) {
    const domain = await this.getSigningDomain()
    const types = {
      TokenInfos: [
        {name: "tokenId", type: "uint256"},
        {name: "torso", type: "uint8[2]"},
        {name: "horns", type: "uint8[2]"},
        {name: "arms", type: "uint8[2]"},
        {name: "eyes", type: "uint8[2]"},
        {name: "legs", type: "uint8[2]"},
        {name: "tail", type: "uint8[2]"},
        {name: "ability1", type: "uint8"},
        {name: "ability2", type: "uint8"},
        {name: "expireTime", type: "uint256"},
      ]
    };
    const signature = await this.signer._signTypedData(domain, types, heroNftVoucher);
    return {
      ...heroNftVoucher,
      signature,
    };
  }

  async getSigningDomain() {
    const domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: CONTRACT_ADDRESS,
      chainId: CHAIN_ID,
    };
    return domain;
  }

  getProvider() {
    return  new ethers.providers.JsonRpcProvider(RPC_NODE_URL);
  }

  getSigner(provider) {
    return new ethers.Wallet(SERVER_PRIVATE_KEY, provider);
  }

}

module.exports = new NftService();
