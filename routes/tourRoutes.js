const express = require('express');
const {
  deleteTour,
  createTour,
  updateTour,
  getAllTours,
  getTour,
  checkID,
  checkBody,
} = require('../controllers/toursController.js');

const router = express.Router();

//Param Middleware --------------------------------------------------------------------------
router.param('id', checkID);

//Routes ------------------------------------------------------------------------------------
router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

//export ------------------------------------------------------------------------------------
module.exports = router;
