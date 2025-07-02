/* eslint-env node */
const fs = require('fs');

module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  devServer: {
    https: {
      key: fs.readFileSync('src/assets/https/server-key.pem'),
      cert: fs.readFileSync('src/assets/https/server.pem'),
    },
  },
};
