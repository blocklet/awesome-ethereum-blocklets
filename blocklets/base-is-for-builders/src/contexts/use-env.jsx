import { createContext, useContext, useEffect, useMemo } from 'react';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { Avatar } from '@mui/material';
import BNBIcon from 'cryptocurrency-icons/128/color/bnb.png';
import ETHIcon from 'cryptocurrency-icons/128/color/eth.png';
import OptimismIcon from '../assets/optimism.svg';

const ABTIcon = 'https://assets.arcblock.io/icons/arc-abt-icon.png';

const EnvContext = createContext();

const ICON_MAP = {
  bnb: BNBIcon,
  eth: ETHIcon,
  abt: ABTIcon,
  base: 'https://bridge.base.org/icons/base.svg',
  optimism: OptimismIcon,
};

function EnvProvider({ children }) {
  const env = useReactive({
    txFeeMap: {
      nft: 0,
      factory: 0,
    },
    hasNFTBlender: false,
    didSpacesDisplayUrl: '',
    uploadHost: '',
    tokensList: [],
    chainList: [],
    enableChainList: [],
    enableEvmChainList: [],
    hadInit: false,
  });

  async function refresh() {
    async function getEnv() {
      const mockChainList = [
        {
          networkName: 'base-mainnet',
          chainName: 'Base Mainnet',
          chainId: '8453',
          symbol: 'ETH',
          defaultRPC: 'https://developer-access-mainnet.base.org',
          explorer: 'https://basescan.org',
          verifyUrl: 'https://api.basescan.org/api',
          contractAddress: '0x1FC10ef15E041C5D3C54042e52EB0C54CB9b710c',
          icon: 'base',
          enable: true,
          decimal: 18,
          isTest: false,
        },
      ];
      env.chainList = mockChainList.map((item) => {
        const iconSrc = ICON_MAP[item.icon];
        return {
          ...item,
          iconSrc,
          IconAvatar: (props) => <Avatar src={iconSrc} alt={item.icon} sx={{ width: 24, height: 24 }} {...props} />,
        };
      });
      env.enableChainList = (env.chainList || []).filter((item) => item.enable);
      env.enableEvmChainList = (env.enableChainList || []).filter(
        (item) => !['ocap', 'beta', 'main', 'default'].includes(item.chainId)
      );
    }
    await getEnv();

    return env;
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      env,
      refresh,
    }),
    [env, refresh]
  );

  return <EnvContext.Provider value={value}>{children}</EnvContext.Provider>;
}

EnvProvider.propTypes = {
  children: PropTypes.node,
};

EnvProvider.defaultProps = {
  children: null,
};

function useEnv() {
  const context = useContext(EnvContext);
  if (!context) {
    throw new Error('useEnv must be used within an EnvProvider');
  }
  return context;
}

export { EnvProvider, useEnv };
