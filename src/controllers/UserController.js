const {Router} = require('express');
const userService = require('../services/UserService');
const checkAuth = require('../utils/auth');

const router = Router();

router.get('/:address/isauthorised', async (req, res, next) => {
  const address = req.params.address;
  const hmac = req.headers.checksum;
  if(!address) {
    res
      .status(500)
      .json({error: "There is no 'address' variable in query"});
  }

  try {
    const status = await userService.getAuthorizeStatus(address, hmac);
    res
      .status(200)
      .json({
        isAuthorised: status
      });
  } catch (e) {
    next(e);
  }
});

router.get('/:address', async (req, res, next) => {
  const address = req.params.address;
  if(!address) {
    res
      .status(500)
      .json({error: "There is no 'address' variable in query"});
  }

  try {
    const user = await userService.getUser(address);
    res
      .status(200)
      .json(user);
  } catch (e) {
    next(e);
  }
});

router.put('/amount', async (req, res, next) => {
  try {
    const token = req.headers.token;
    const amount = req.body.amount;
    const user = await userService.addAmount(token, amount);
    res
      .status(200)
      .json(user);
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  const payload = req.body;
  try {
    const token = await userService.createOrUpdateUser(payload);
    res
      .status(200)
      .json({token});
  } catch (e) {
    next(e);
  }
});

router.post('/logout', async (req, res, next) => {
  const token = req.headers.token;
  try {
    await userService.removeToken(token);
    res
      .status(200)
      .json({isAuthorised: false});
  } catch (e) {
    next(e);
  }
});

module.exports = router;
