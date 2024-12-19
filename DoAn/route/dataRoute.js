const express = require('express');
const router = express.Router();
const dataController = require('../controller/dataController');
const authenticateToken= require('../middleware/authenticateToken')


// Routes to get data
router.get('/dht11/latest', authenticateToken, dataController.getDht11DataLatest);
router.get('/max30100/latest',authenticateToken, dataController.getMax30100DataLatest);
router.get('/dht11/alldata',authenticateToken, dataController.getAllDht11Data);
router.get('/max30100/alldata',authenticateToken, dataController.getALLMax30100Data);
router.get('/dht11/dataChart',authenticateToken, dataController.get10Dht11Data);
router.get('/max30100/dataChart',authenticateToken, dataController.get10Max30100Data);
router.get('/dht11/search',authenticateToken, dataController.searchDht11Data);
router.get('/max30100/search',authenticateToken, dataController.searchMax30100Data);



module.exports = router;
