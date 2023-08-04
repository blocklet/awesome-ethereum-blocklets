const fs = require('fs');
const path = require('path');
const pick = require('lodash/pick');
const { toBase58 } = require('@ocap/util');
const ethers = require('ethers');
const waitFor = require('p-wait-for');

const getContractList = () => {
  // use fs to red contracts dir
  const contractsDir = fs.readdirSync(path.join(__dirname, '../contracts'));
  const contractList = contractsDir.map((contract) => {
    const contractName = contract.split('.')[0];
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const item = require(`../contracts/${contractName}.json`);
    return item;
  });

  return contractList;
};

const getChainList = () => {
  const customChainList = [
    {
      networkName: 'base-mainnet',
      chainName: 'Base Mainnet',
      chainId: '8453',
      symbol: 'ETH',
      defaultRPC: 'https://developer-access-mainnet.base.org',
      explorer: 'https://basescan.org',
      verifyUrl: 'https://api.basescan.org/api',
      icon: 'base',
      enable: true,
      decimal: 18,
      isTest: false,
    },
  ];
  return customChainList;
};

const getContractMessageByReceipt = ({ receipt, ...rest }) => {
  return {
    ...pick(receipt, ['blockHash', 'transactionHash', 'blockNumber']),
    ...rest,
    effectiveGasPrice: receipt?.effectiveGasPrice?.toString(),
    createdAt: new Date().toISOString(),
  };
};

const getAuthPrincipal = async ({ extraParams }) => {
  const { chainId } = extraParams;

  if (chainId) {
    return {
      chainInfo: {
        type: 'ethereum',
        id: chainId, // string
        host: 'none', // must
      },
    };
  }

  return {
    chainInfo: {
      type: 'ethereum',
      id: '1', // string
      host: 'none', // must
    },
  };
};

function getChainInfo(chainId = '1') {
  return getChainList().find((x) => x.chainId === chainId);
}

function getProvider(chainId = '1') {
  const { defaultRPC } = getChainInfo(chainId);
  return new ethers.providers.JsonRpcProvider(defaultRPC);
}

const getChainId = async ({ contract }) => {
  const chainId = await contract.provider.getNetwork().then((res) => res.chainId);
  return `${chainId}`;
};

async function getTxData(params = {}, type = 'arcblock') {
  const { contract, fn, args, value, txData: _txData, chainId: _chainId, gasLimit: _gasLimit, to: _to } = params;

  // if txData is set, ignore fn and args
  const txData = _txData || contract.interface.encodeFunctionData(fn, args);

  // if txData is set, ignore contract
  const chainId = _chainId || (await getChainId({ contract }));

  // const gasPrice = await getGasPrice({ provider: contract.provider });
  // const gasPriceAsGwei = Math.ceil(ethers.utils.formatUnits(gasPrice, 'gwei').toString());

  const extraEtherValueMap = value
    ? {
        value,
      }
    : {};

  const to = _to || contract?.address || null;

  const gasLimit =
    _gasLimit ||
    (await contract.provider
      .estimateGas({
        to,
        data: txData,
        ...extraEtherValueMap,
      })
      .then((res) => res.toString()));

  if (type === 'arcblock') {
    return toBase58(
      Buffer.from(
        JSON.stringify({
          network: chainId,
          tx: {
            to,
            value: '0',
            gasLimit,
            ...extraEtherValueMap,
            data: txData,
          },
        }),
        'utf-8'
      )
    );
  }

  return {
    txData,
    gasLimit,
  };
}

const waitForTxReceipt = async ({ contract, provider, txHash }) => {
  let tx = {};
  let receipt = {};
  const txHashTemp = txHash;

  await waitFor(
    async () => {
      // ethers getTransaction
      tx = await provider.getTransaction(txHashTemp);
      return !!tx?.blockNumber;
    },
    { interval: 3000, timeout: 30 * 60 * 1000 }
  );

  await waitFor(
    async () => {
      // ethers getTransactionReceipt
      const originReceipt = await provider.getTransactionReceipt(txHashTemp);
      receipt = {
        ...originReceipt,
        parseLog:
          contract &&
          originReceipt?.logs?.map((log) => {
            try {
              return contract.interface.parseLog(log);
            } catch (_error) {
              return log;
            }
          }),
      };
      return !!receipt?.blockNumber;
    },
    { interval: 3000, timeout: 30 * 60 * 1000 }
  );

  return receipt;
};

module.exports = {
  getContractList,
  getChainList,
  getAuthPrincipal,
  getContractMessageByReceipt,
  getProvider,
  getChainId,
  getChainInfo,
  getTxData,
  waitForTxReceipt,
};
