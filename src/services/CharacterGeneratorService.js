const repository = require("../repositories/HeroesRepository");
const {uniqueNamesGenerator, adjectives, colors, animals, names} = require("unique-names-generator");
const bodyPartTypes = require("../constants/body-part-types");
const bodyPartsRepository = require("../repositories/BodyPartRepository");
const abilities = require("../constants/abilities-types");
const {ProbabilityBasedRandom} = require("../utils/ProbabilityBasedRandom");
const {STATS_RARITY_CONFIG} = require("../constants/stats-rarity-config");
const {SPEED_RARITY_CONFIG} = require("../constants/speed-rarity-config");

class CharacterGeneratorService {
  constructor() {
    this.statsRandom = new ProbabilityBasedRandom(STATS_RARITY_CONFIG);
    this.speedRandom = new ProbabilityBasedRandom(SPEED_RARITY_CONFIG);
  }

  async createHeroName() {
    let name = this.createUniqueName();
    while (await repository.heroIsExisted(name)) {
      name = this.createUniqueName();
    }
    return name;
  }

  createUniqueName() {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals, names],
      length: 3,
      separator: ' ',
      style: 'capital'
    });
  }

  async createAttributes() {
    const attributes = await this.getRandomBodyParts();
    const abilitiesPart = this.getRandomAbilities();
    const speed = this.speedRandom.next();

    return {...attributes, speed, ...abilitiesPart};
  }

  async getRandomBodyParts() {
    const bodyParts = Object.keys(bodyPartTypes);
    const attributes = {};
    for (const partName of bodyParts) {
      const rarity = this.statsRandom.next();
      const bodyPart = await bodyPartsRepository.getByTypeAndLevel(bodyPartTypes[partName], rarity);
      const [startRange, endRange] = bodyPart.range;
      const random = this.getRandom(startRange, endRange);

      attributes[bodyPartTypes[partName]] = {
        id: bodyPart.partId,
        stat: random
      }
    }
    return attributes;
  }

  getRandomAbilities() {
    const abilitiesPart = {};

    const maxAbilityNumber = this.getMaxAbilityNumber();
    abilitiesPart.ability1 = this.getRandom(0, maxAbilityNumber);
    let ability2 = this.getRandom(0, maxAbilityNumber);
    while (ability2 === abilitiesPart.ability1) {
      ability2 = this.getRandom(0, maxAbilityNumber);
    }
    abilitiesPart.ability2 = ability2;

    return abilitiesPart;
  }

  getMaxAbilityNumber() {
    let max = 0;
    for (const key of Object.keys(abilities)) {
      if (abilities[key] > max) {
        max = abilities[key];
      }
    }
    return max;
  }

  getRandom(min, max) {
    return min + Math.ceil(Math.random() * (max - min));
  }
}

module.exports = new CharacterGeneratorService();
