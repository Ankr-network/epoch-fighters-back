const {Router} = require('express');
const heroService = require('../services/HeroService');
const checkAuth = require('../utils/auth');

const router = Router();

router.use(checkAuth);

router.get('/', async (req, res, next) => {
  try {
    const heroesList = await heroService.getHeroesList();
    res
      .status(200)
      .json(heroesList);
  } catch (e) {
    res
      .status(500)
      .json({error: e.message});
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const heroId = req.params.id;
    const hero = await heroService.getHero(heroId);
    res
      .status(200)
      .json(hero);
  } catch (e) {
    res
      .status(500)
      .json({error: e.message});
  }
});

router.get('/owner/:address', async (req, res, next) => {
  try {
    const address = req.params.address;
    const heroesList = await heroService.getHeroByUser(address);
    res
      .status(200)
      .json(heroesList);
  } catch (e) {
    res
      .status(500)
      .json({error: e.message});
  }
});

router.post('/', async (req, res, next) => {
  try {
    // const token = req.headers.token;
    // const heroItem = await heroService.addHero(token);
    res
      .status(201)
      .json({});
  } catch (e) {
    res
      .status(500)
      .json({error: e.message});
  }
});

module.exports = router;
