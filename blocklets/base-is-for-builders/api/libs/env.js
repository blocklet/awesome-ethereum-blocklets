const env = require('@blocklet/sdk/lib/env');

const isLocal = ['true', true].includes(process.env.IS_LOCAL);

module.exports = {
  ...env,
  chainHost: process.env.CHAIN_HOST || '',
  isLocal,
};
