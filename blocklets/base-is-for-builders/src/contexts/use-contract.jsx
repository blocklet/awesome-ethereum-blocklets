import { createContext, useContext, useEffect, useMemo } from 'react';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import keyBy from 'lodash/keyBy';
import api from '../libs/api';

const ContractContext = createContext();

function ContractProvider({ children }) {
  const contract = useReactive({
    contractAddress: null,
    contractList: [],
    contractMap: {},
    hadInit: false,
  });

  async function refresh() {
    async function getContract() {
      const { data } = await api.get('/api/contracts');
      contract.contractList = data.map((item) => {
        // eslint-disable-next-line no-unused-vars
        const { key, contractAddress, contractName, abi } = item;
        let onMintClick = null;
        if (key === 'base-is-for-builders') {
          // TODO
          onMintClick = async () => {};
        }
        return {
          ...item,
          onMintClick,
        };
      });
      contract.contractMap = keyBy(data, 'contractAddress');
      if (!contract.contractAddress) {
        contract.contractAddress = contract?.contractList?.[0]?.contractAddress;
      }
      contract.hadInit = true;
    }
    await getContract();

    return contract;
  }

  const getCurrentContract = (contractAddress) => {
    return contract?.contractMap?.[contractAddress || contract.contractAddress];
  };

  const setCurrentContractAddress = (contractAddress) => {
    contract.contractAddress = contractAddress;
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      contract,
      refresh,
      getCurrentContract,
      setCurrentContractAddress,
    }),
    [contract, refresh]
  );

  return <ContractContext.Provider value={value}>{children}</ContractContext.Provider>;
}

ContractProvider.propTypes = {
  children: PropTypes.node,
};

ContractProvider.defaultProps = {
  children: null,
};

function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within an ContractProvider');
  }
  return context;
}

export { ContractProvider, useContract };
