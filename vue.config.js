/* eslint-env node */
const fs = require('fs');

module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  devServer: {
    // 熱更新連線預設會用本機區網 IP，不在憑證名單內會被擋，固定連 localhost
    public: 'localhost:8080',
    https: {
      key: fs.readFileSync('src/assets/https/server-key.pem'),
      cert: fs.readFileSync('src/assets/https/server.pem'),
    },
  },
};
