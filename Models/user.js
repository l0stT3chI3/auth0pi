const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  isvalid: {
    type: Boolean,
    required: true,
    default: false,
  },

  date: {
    type: Date,
  },

  uniqueString: {
    type: String,
    required: true,
  },
  blacklist: [{ type: String }],

  sessionTokens: [{ type: String }],
});

module.exports = mongoose.model("user", userSchema);
