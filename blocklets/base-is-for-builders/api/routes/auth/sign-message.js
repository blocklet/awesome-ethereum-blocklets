const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo } = require('@arcblock/did');
const ethers = require('ethers');
const { utf8ToHex } = require('@ocap/util');
const logger = require('../../libs/logger');
const { api } = require('../../libs/request');
const { getAuthPrincipal } = require('../../libs');

const message = 'all your base are belong to you.';

module.exports = {
  action: 'sign-message',
  claims: [
    {
      authPrincipal: getAuthPrincipal,
    },
    {
      signature: async ({ extraParams }) => {
        const { chainId, contractAddress } = extraParams;

        const hexMessage = utf8ToHex(message);

        return {
          description: `Please sign the message: ${message}`,
          type: 'eth:personal-data',
          data: JSON.stringify({
            network: chainId,
            address: contractAddress,
            data: hexMessage,
          }),
        };
      },
    },
  ],
  // `nw` is ABBR for `nextWorkflow`
  onAuth: async ({ userDid, userPk, extraParams, claims }) => {
    const type = toTypeInfo(userDid);
    const wallet = fromPublicKey(userPk, type);
    const claim = claims.find((x) => x.type === 'signature');
    const { sig } = claim;

    const isValid = userDid.toLowerCase() === ethers.utils.verifyMessage(message, sig).toLowerCase();

    if (!isValid) throw Error('Message signature wrong!');

    logger.info('eth.onAuth', {
      userPk,
      data: claim.origin.data,
    });

    if (wallet.ethVerify(ethers.utils.hashMessage(message), sig, false) === false) {
      throw new Error('ArcBlock verify invalid signature');
    }

    extraParams.sig = claim.sig;
    const { nwUrl } = extraParams;
    const urlWithSign = new URL(nwUrl);

    // add signature to url
    urlWithSign.searchParams.set('sig', claim.sig);

    const { data } = await api.get(urlWithSign.href);

    return {
      nextWorkflow: data.url,
    };
  },
};
