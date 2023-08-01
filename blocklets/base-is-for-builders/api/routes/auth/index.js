const { handlers } = require('../../libs/auth');
const mintNFTHandler = require('./mint-nft');
const signMessageHandler = require('./sign-message');

module.exports = {
  init(app) {
    handlers.attach({ app, ...mintNFTHandler });
    handlers.attach({ app, ...signMessageHandler });
  },
};
