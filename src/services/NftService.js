const ethers = require('ethers');
const userRepository = require("../repositories/UsersRepository");
const heroRepository = require("../repositories/HeroesRepository");
const heroNftMapper = require("../utils/hero-nft-mapper");
const CodedError = require('../utils/CodedError');
const crypto = require("../utils/crypto");
const {numberToHex} = require("../utils/HexUtils");

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
const RPC_NODE_URL = process.env.RPC_NODE_URL;
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ADDRESS = "0x179f465bE0B69d30E086f87f6A3dfD17C4f25072";
const CHAIN_ID = process.env.CHAIN_ID;
const SIGNING_DOMAIN_NAME = "Epoch"
const SIGNING_DOMAIN_VERSION = "1"
const EVENT_NAME = "TokenMintedWithSignature";

class NftService {
  constructor() {
    this.provider = this.getProvider();
    this.signer = this.getSigner(this.provider);
  }

  async getSignedHeroNFT(heroId, token) {
    const user = await userRepository.getUserByToken(token);
    const hero = await heroRepository.getHeroById(heroId);

    if (hero.userId.equals(user._id)) {
      const heroNftVoucher = heroNftMapper(hero);
      console.log(heroNftVoucher);
      return this.signData(heroNftVoucher);
    } else {
      throw new CodedError(401, `Fighter ${hero.name} doesn't belong to your account`);
    }
  }

  async signData(heroNftVoucher) {
    const domain = await this.getSigningDomain()
    const types = {
      ItemInfo: [
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
      signature: crypto.hexToBytes(signature),
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
    return new ethers.providers.JsonRpcProvider(RPC_NODE_URL);
  }

  getSigner(provider) {
    return new ethers.Wallet(SERVER_PRIVATE_KEY, provider);
  }

  async checkMintedNft(transactionHash, token) {
    const logs = await crypto.getLogsByHash(transactionHash);
    const event = logs.find(log => log.name === EVENT_NAME);
    if (!event) {
      throw new CodedError(500, `There is no event ${EVENT_NAME} in logs for transaction ${transactionHash}`);
    }

    const heroId = numberToHex(event.values.backendId);
    const tokenId = event.values.tokenId

    const user = await userRepository.getUserByToken(token);
    const hero = await heroRepository.getHeroById(heroId);

    if (hero.userId.equals(user._id)) {
      await heroRepository.updateTokenId(heroId, tokenId);
      return true;
    } else {
      throw new CodedError(401, `Fighter ${hero.name} doesn't belong to your account`);
    }

    return false;
  }
}

module.exports = new NftService();
