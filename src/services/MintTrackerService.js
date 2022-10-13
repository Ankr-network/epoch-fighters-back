const cacheProvider = require("../utils/CacheProvider");
const crypto = require("../utils/crypto");
const heroRepository = require("../repositories/HeroesRepository");
const userRepository = require("../repositories/UsersRepository");

const MINT_EVENT_NAME = "TokenMintedWithSignature";
const LAST_BLOCK_FIELD_NAME = "lastBlock";

class MintTrackerService {
  async startTracking() {
    await this.getPastEvent();
    // await this.subscribeToEvents();
  }

  async subscribeToEvents() {
    const lastBlock = this.getLastBlock();
    await crypto.subscribeToEvents(MINT_EVENT_NAME, lastBlock);
  }

  async getPastEvent() {
    const lastBlock = this.getLastBlock();

    if (lastBlock == undefined) {
      return;
    }

    const events = await crypto.getPastEvents(MINT_EVENT_NAME, lastBlock);

    console.log(events);

    if (events.length > 0) {
      for (const event of events) {
        await this.handleEvent(event);
      }
    }
  }

  async handleEvent(event) {
    const tokenId = event.returnValues.tokenId
    const heroId = event.returnValues.backendId
    if (tokenId && heroId) {
      await heroRepository.updateTokenId(heroId, tokenId);
    }
    this.setLastBlock(event.blockNumber);
  }

  getLastBlock() {
    return cacheProvider.get(LAST_BLOCK_FIELD_NAME);
  }

  setLastBlock(lastBlock) {
    return cacheProvider.set(LAST_BLOCK_FIELD_NAME, lastBlock);
  }
}

module.exports = new MintTrackerService();
