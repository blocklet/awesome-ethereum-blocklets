import dayjs from 'dayjs';
import joinUrl from 'url-join';
import waitFor from 'p-wait-for';

export function getExplorerUrl({ explorer, value, type = 'address' }) {
  const url = explorer && value && joinUrl(explorer, type, value);
  return url;
}

export function formatTime(time) {
  return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
}

export const waitForTxReceipt = async ({ contract, provider, txHash }) => {
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

export function isIframeWrapper() {
  return (
    (window.self.frameElement && window.self.frameElement.tagName === 'IFRAME') ||
    window.frames.length !== window.parent.frames.length ||
    window.self !== window.top ||
    window?.parent !== window
  );
}
