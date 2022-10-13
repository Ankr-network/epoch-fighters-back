const {Router} = require('express');
const service = require('../services/NftService');
const checkAuth = require('../utils/auth');

const router = Router();

router.use(checkAuth);

router.get('/prepare/:heroid', async (req, res, next) => {
  const heroId = req.params.heroid;
  const token = req.headers.token;
  try {
    const signedHeroNFT = await service.getSignedHeroNFT(heroId, token);
    res
      .status(200)
      .json(signedHeroNFT);
  } catch (e) {
    res
      .status(500)
      .json({error: e.message});
  }
});

router.put('/check', async (req, res, next) => {
  const token = req.headers.token;
  const hash = req.body.hash;
  try {
    const mintStatus = await service.checkMintedNft(hash, token);
    res
      .status(200)
      .json({minted: mintStatus});
  } catch (e) {
    res
      .status(500)
      .json({error: e.message});
  }
});

module.exports = router;
