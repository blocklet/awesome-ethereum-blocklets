const router = require('express').Router();
const { getChainList, getContractList } = require('../libs');

router.get('/env', (req, res) => {
  const envMap = {
    chainList: getChainList(),
  };

  return res.json(envMap);
});

router.get('/contracts', (req, res) => {
  return res.json(getContractList());
});

module.exports = router;
