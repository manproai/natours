const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: `${__dirname}/config.env` });

const app = require(`./app.js`);

const DB = process.env.MONGODB_ATLAS.replace(
  '<password>',
  process.env.MONGODB_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection established');
  })
  .catch((error) => {
    console.error(error);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
