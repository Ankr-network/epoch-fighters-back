const {DateTime} = require("luxon");
const {hexToNumber} = require("../utils/HexUtils");

const heroNftMapper = (hero) => {
  const {
    torso,
    horns,
    arms,
    eyes,
    legs,
    tail,
    ability1,
    ability2
  } = hero.attributes;
  const expireTime = Math.floor(DateTime.now().plus({minutes: 10}).toMillis() / 1000);

  return {
    tokenId: hexToNumber(hero.id),
    torso: bodyPartToArray(torso),
    horns: bodyPartToArray(horns),
    arms: bodyPartToArray(arms),
    eyes: bodyPartToArray(eyes),
    legs: bodyPartToArray(legs),
    tail: bodyPartToArray(tail),
    ability1,
    ability2,
    expireTime
  }
}

const bodyPartToArray = (bodyPart) => {
  return [bodyPart.id, bodyPart.stat];
}

module.exports = heroNftMapper;
