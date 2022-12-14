const repository = require("../repositories/EnemyRepository");
const userRepository = require("../repositories/UsersRepository");
const characterGeneratorService = require("./CharacterGeneratorService");

class EnemyService {
  getEnemiesList() {
    return repository.getFullList();
  }

  getEnemy(id) {
    return repository.getEnemyById(id);
  }

  async addEnemy(token) {
    const user = await userRepository.getUserByToken(token);
    const enemy = {
      name: await characterGeneratorService.createHeroName(),
      attributes: await characterGeneratorService.createAttributes(user.rate)
    }

    return await repository.addEnemy(enemy);
  }
}

module.exports = new EnemyService();
