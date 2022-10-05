const dotenv = require('dotenv').config();
const mongoose = require('mongoose');


process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.log(err.message, err.name);
  process.exit(1);
});

const app = require(`./app.js`);


const atlasDB = process.env.MONGODB_ATLAS.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
const localDB = process.env.DATABASE_LOCAL;

mongoose.connect(localDB).then(() => {
  console.log('DB connection established');
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
