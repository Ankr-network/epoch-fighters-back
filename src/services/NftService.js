const ethers = require('ethers');
const userRepository = require("../repositories/UsersRepository");
const heroRepository = require("../repositories/HeroesRepository");
const mapHeroToNftVoucher = require("../utils/hero-nft-mapper");
const CodedError = require('../utils/CodedError');
const crypto = require("../utils/crypto");
const {numberToHex} = require("../utils/HexUtils");
const {NFT_VOUCHER_TYPES} = require("../constants/nft-voucher-types");

const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY;
// const RPC_NODE_URL = process.env.RPC_NODE_URL;
const RPC_NODE_URL = "https://rpc.ankr.com/eth_goerli";
// const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ADDRESS = "0xE401ed41086729470f504b631ca6aa1e356Da029";
// const CHAIN_ID = process.env.CHAIN_ID;
const CHAIN_ID = 5;
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
      const heroNftVoucher = mapHeroToNftVoucher(hero);

      heroNftVoucher.speed *= 10;

      return this.signData(heroNftVoucher);
    } else {
      throw new CodedError(401, `Fighter ${hero.name} doesn't belong to your account`);
    }
  }

  async signData(heroNftVoucher) {
    const domain = await this.getSigningDomain()
    const signature = await this.signer._signTypedData(domain, NFT_VOUCHER_TYPES, heroNftVoucher);
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
