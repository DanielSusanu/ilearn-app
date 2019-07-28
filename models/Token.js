const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const TokenSchema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200
  }
});

module.exports = Token = mongoose.model('tokens', TokenSchema);
