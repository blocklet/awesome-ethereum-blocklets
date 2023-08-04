import { createContext, useContext, useEffect, useMemo } from 'react';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import { Avatar } from '@mui/material';
import BNBIcon from 'cryptocurrency-icons/128/color/bnb.png';
import ETHIcon from 'cryptocurrency-icons/128/color/eth.png';
import OptimismIcon from '../assets/optimism.svg';
import api from '../libs/api';

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
    chainId: null,
    chainList: [],
    enableChainList: [],
    enableEvmChainList: [],
    hadInit: false,
  });

  async function refresh() {
    async function getEnv() {
      const { data } = await api.get('/api/env');
      env.chainList = data?.chainList?.map((item) => {
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
      if (!env.chainId) {
        env.chainId = env?.chainList?.[0]?.chainId;
      }
      env.hadInit = true;
    }
    await getEnv();

    return env;
  }

  const getCurrentChain = (chainId) => {
    return env?.chainList?.find((item) => item.chainId === (chainId || env.chainId));
  };

  const setCurrentChainId = (chainId) => {
    env.chainId = chainId;
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      env,
      refresh,
      getCurrentChain,
      setCurrentChainId,
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
