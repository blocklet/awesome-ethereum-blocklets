const { fromPublicKey } = require('@ocap/wallet');
const { toTypeInfo, isEthereumDid } = require('@arcblock/did');
const ethers = require('ethers');
const BaseIsForBuildersContract = require('../../contracts/base-is-for-builders.json');
// const bridgeToBase = require('../../contracts/bridge-to-base.json');
const logger = require('../../libs/logger');
const { getAuthPrincipal, getProvider, getTxData } = require('../../libs');

module.exports = {
  action: 'mint-nft',
  claims: [
    {
      authPrincipal: getAuthPrincipal,
    },
    {
      signature: async ({ userDid, extraParams }) => {
        const { chainId, contractAddress, sig } = extraParams;

        if (!sig) {
          throw new Error('sig is required');
        }

        const isETHWalletType = isEthereumDid(userDid);

        logger.info({ isETHWalletType, chainId, sig });

        if (isETHWalletType) {
          const provider = await getProvider(chainId);
          const contract = new ethers.Contract(contractAddress, BaseIsForBuildersContract.abi, provider);

          const txData = await getTxData({
            gasLimit: '100000',
            contract,
            fn: 'mint',
            args: [sig],
            value: '0',
          });

          return {
            description: `Please sign the transaction to mint NFT with sig: ${sig}`,
            type: 'eth:transaction',
            data: txData,
          };
        }

        throw new Error('Unsupported wallet type');
      },
    },
  ],

  onAuth: async ({ userDid, userPk, claims, updateSession }) => {
    const type = toTypeInfo(userDid);
    const wallet = fromPublicKey(userPk, type);
    const claim = claims.find((x) => x.type === 'signature');

    const isETHWalletType = isEthereumDid(wallet.address);

    if (isETHWalletType) {
      const { hash } = claim;
      logger.info('mint NFT tx hash:', { hash });
      if (hash) {
        await updateSession({
          txHash: hash,
        });
      }

      return {
        hash,
      };
    }

    throw new Error('Unsupported wallet type');
  },
};
