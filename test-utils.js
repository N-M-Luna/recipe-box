const mongoose = require('mongoose');
const models = [require('./models/token'), require('./models/user')];

module.exports = {};

module.exports.connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URL, {});
  //My console says this is undefined.
  //https://stackoverflow.com/questions/55604057/what-is-mongo-url-and-what-should-it-be-set-to
  //https://stackoverflow.com/questions/51770772/mongoose-connect-first-argument-should-be-string-received-undefined
  await Promise.all(models.map(m => m.syncIndexes()));
}

module.exports.stopDB = async () => {
  await mongoose.disconnect();
}

module.exports.clearDB = async () => {
  await Promise.all(models.map(model => model.deleteMany()))
}

module.exports.findOne = async (model, query) => {
  const result = await model.findOne(query).lean();
  if (result) {
    result._id = result._id.toString();
  }
  return result;
}

module.exports.find = async (model, query) => {
  const results = await model.find(query).lean();
  results.forEach(result => {
    result._id = result._id.toString();
  });
  return results;
}