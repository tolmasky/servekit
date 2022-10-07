const spawn = require("@await/spawn");

module.exports = async (...args) => await spawn.silent("openssl", args);
