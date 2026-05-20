const express = require('express');
const router = express.Router();
const mealLogs = require('../controllers/mealLogs');
const { verifyToken } = require('../utilities/auth');

router.use(verifyToken);

router.route('/')
    .get(mealLogs.index)
    .post(mealLogs.createMealLog);

router.get('/form-data', mealLogs.getFormData);

router.route('/:id')
    .get(mealLogs.showMealLog)
    .put(mealLogs.updateMealLog)
    .delete(mealLogs.destroyMealLog);

router.get('/:id/form-data', mealLogs.getEditFormData);

router.use(mealLogs.error);

module.exports = router;
