const {Router} = require('express');
const userService = require('../services/UserService');

const router = Router();

router.get('/:address/isauthorised', async (req, res, next) => {
  const address = req.params.address;
  if(!address) {
    res
      .status(500)
      .json({error: "There is no 'address' variable in query"});
  }

  try {
    const status = await userService.getAuthorizeStatus(address);
    res
      .status(200)
      .json({
        address,
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
  console.log(req.body);
  try {
    const token = await userService.createOrUpdateUser(payload);
    res
      .status(200)
      .json({token});
  } catch (e) {
    next(e);
  }
});

module.exports = router;
