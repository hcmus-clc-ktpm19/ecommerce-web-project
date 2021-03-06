const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  // Schema attributes are defined here
  username: String,
  password: String,
  email: String,
  name: String,
  phone: String,
  address: String,
  sex: String,
  dob: String,
  avatar_url: String,
  activation_string: String,
  status: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

// Create account model in db
module.exports = mongoose.model('account', accountSchema, 'account');