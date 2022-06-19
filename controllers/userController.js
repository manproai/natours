const fs = require('fs');

//Reading a file ------------------------------------------------------------
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
);

//Controllers ----------------------------------------------------------------
exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

exports.getUser = (req, res) => {
  console.log(req.requestTime);
  const id = req.params.id * 1;
  const selectedUser = users.find((t) => t.id === id);
  if (selectedUser) {
    return res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: {
        selectedUser,
      },
    });
  }
  res.status(404).json({
    status: 'fail',
    message: 'Invalid ID',
  });
};

exports.updateUser = (req, res) => {
  const id = req.params.id * 1;
  const selectedUser = users.find((t) => t.id === id);

  if (!selectedUser) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  for (const key in req.body) {
    users[id][key] = req.body[key];
  }
  const updatedUser = users[id];
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      if (err) console.log(err);
      res.status(200).json({
        status: 'success',
        data: {
          updatedUser,
        },
      });
    }
  );
};

exports.deleteUser = (req, res) => {
  const id = req.params.id * 1;
  const selectedUser = users.find((t) => t.id === id);

  if (!selectedUser) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  users.splice(users.indexOf(selectedUser), 1);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      if (err) console.log(err);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);
  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      if (err) throw new Error(err);
      res.status(201).json({
        status: 'success',
        data: {
          users: newUser,
        },
      });
    }
  );
};

