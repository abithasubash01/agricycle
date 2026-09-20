const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const db = require('../db');
  res.status(200).json({
    status: 'ok',
    message: 'AGRICYCLE backend running',
    version: '2.0.0',
    dbMode: db.getMode()
  });
});

module.exports = router;
