const express = require('express');

const {
  deleteTour,
  createTour,
  updateTour,
  getAllTours,
  getTour,
  aliasTopCheapTours,
  getTourStats,
  getMonthlyPlan,
} = require(`../controllers/toursController.js`);

const router = express.Router();

//Aliasing ------------------------------------------------------------------------------------
router.route('/top-5-cheap').get(aliasTopCheapTours, getAllTours);

//Stats using aggregation pipeline ---------------------------------------------------------------
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

//Routes ------------------------------------------------------------------------------------
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

//export ------------------------------------------------------------------------------------
module.exports = router;
