const HeroModel = require('../models/Hero');

class HeroesRepository {
  getHeroesList() {
    return HeroModel.find();
  }

  getHeroesListByUser(userId) {
    return HeroModel.find({userId});
  }

  getHeroById(id) {
    return HeroModel.findOne({_id: id});
  }

  heroIsExisted(name) {
    return HeroModel.exists({name});
  }

  async addHeroItem(hero) {
    const command = new HeroModel(hero);
    return await command.save();
  }

  async updateTokenId(id, tokenId) {
    await HeroModel.updateOne({_id: id}, {tokenId});
  }
}

module.exports = new HeroesRepository();
