const fs = require('fs');

//Reading a file ----------------------------------------------------------------
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

//Middleware for checking incorrect Id -----------------------------------------
exports.checkID = (req, res, next) => {
  const selectedTour = tours.find((tour) => tour.id === req.params.id * 1);
  if (!selectedTour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

//Middleware for checking name and price elements ---------------------------------------
exports.checkBody = (req, res, next) => {
  const isBodyCorrect = req.body.name && req.body.price;
  if (!isBodyCorrect) {
    return res.status(400).json({
      status: 'bad request',
      message: 'Missing name or price',
    });
  }
  next();
};

//Controllers --------------------------------------------------------------------
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const selectedTour = tours.find((t) => t.id === id);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      selectedTour,
    },
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;

  for (const key in req.body) {
    tours[id][key] = req.body[key];
  }
  const updatedTour = tours[id];
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) console.log(err);
      res.status(200).json({
        status: 'success',
        data: {
          updatedTour,
        },
      });
    }
  );
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const selectedTour = tours.find((t) => t.id === id);
  tours.splice(tours.indexOf(selectedTour), 1);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) console.log(err);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) throw new Error(err);
      res.status(201).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
    }
  );
};
