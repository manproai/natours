const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.log(err.message, err.name);
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });

const app = require(`./app.js`);

const DB = process.env.MONGODB_ATLAS.replace(
  '<password>',
  process.env.MONGODB_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection established');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
