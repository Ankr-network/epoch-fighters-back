const repository = require("../repositories/HeroesRepository");
const userRepository = require("../repositories/UsersRepository");
const characterGeneratorService = require("./CharacterGeneratorService");

class HeroService {
  getHeroesList() {
    return repository.getHeroesList();
  }

  getHero(id) {
    return repository.getHeroById(id);
  }

  async getHeroByUser(address) {
    const user = await userRepository.getUserByAddress(address);
    return repository.getHeroesListByUser(user.id);
  }

  async addHero(token) {
    const user = await userRepository.getUserByToken(token);

    const hero = {
      name: await characterGeneratorService.createHeroName(),
      userId: user.id,
      attributes: await characterGeneratorService.createAttributes()
    }

    return await repository.addHeroItem(hero);
  }
}

module.exports = new HeroService();
