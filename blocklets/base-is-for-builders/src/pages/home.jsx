import { useRef, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import joinUrl from 'url-join';
import { Button, IconButton, useMediaQuery } from '@mui/material';
import { useReactive } from 'ahooks';
// eslint-disable-next-line import/no-unresolved, no-unused-vars
import ExploreIcon from '@mui/icons-material/Explore';
import DidAddress from '@arcblock/did-connect/lib/Address';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';
import Badge from '@arcblock/ux/lib/Badge';
import { ethers } from 'ethers';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { styled } from '@arcblock/ux/lib/Theme';
import { ETHWallet, LottieAnimation } from '@nft-studio/react';
import NFTContract from '../libs/NFTContract.json';
import AuthDialog from '../components/auth-dialog';
import NFTIntro from '../components/nft-intro';
import { useEnv } from '../contexts/use-env';
import { getExplorerUrl, formatTime, waitForTxReceipt } from '../libs';
import theme from '../libs/theme';
import loading from '../assets/lottie/loading.json';
import success from '../assets/lottie/success.json';

const getAnimationData = (type = 'loading') => {
  if (type === 'loading') {
    return loading;
  }
  return success;
};

function Home() {
  const ethWalletRef = useRef(null);
  const authRef = useRef(null);
  const lottieAnimationRef = useRef(null);
  const { t } = useLocaleContext();
  const classes = useStyles();
  const isMobile = useMediaQuery((_theme) => _theme.breakpoints.down('md'));
  const { env: envMap } = useEnv();

  const state = useReactive({
    chainId: '',
    loading: false,
    animationData: getAnimationData('loading'),
    txUrl: '',
  });

  useEffect(() => {
    if (!state.chainId) {
      state.chainId = envMap?.chainList?.[0]?.chainId;
    }
  }, [envMap.chainList, state.chainId]);

  const playAnimation = () => {
    setTimeout(() => {
      lottieAnimationRef.current?.safePlay();
    }, 200);
  };

  const isLoading = state.loading;
  const isSuccess = state.txUrl && !isLoading;

  const getCurrentChain = () => {
    return envMap?.chainList?.find((item) => item.chainId === state.chainId);
  };

  const { contractAddress, defaultRPC, IconAvatar, chainName, isTest, explorer } = getCurrentChain() || {};

  const onSuccessAuth = async (res) => {
    const [, { txHash }] = res;
    if (!txHash) throw new Error(t('common.unknownError'));

    const txUrl = getExplorerUrl({ explorer, value: txHash, type: 'tx' });
    const provider = new ethers.providers.JsonRpcProvider(defaultRPC);

    try {
      state.loading = true;
      state.animationData = getAnimationData('loading');
      playAnimation();
      authRef.current.close();
      // eslint-disable-next-line no-underscore-dangle
      await waitForTxReceipt({
        provider,
        txHash,
      });
    } catch (error) {
      console.error(error);
    } finally {
      state.loading = false;
      state.animationData = getAnimationData('success');
      state.txUrl = txUrl;
      playAnimation();
    }
  };

  // use other wallet auth
  // eslint-disable-next-line no-unused-vars
  const openAuthDialogOtherWallet = async (wallet) => {
    // use other wallet
    const setChainSuccess = await ethWalletRef.current?.setConnectedChain(state.chainId);

    // should set chain success
    if (!setChainSuccess) throw new Error(t('common.setChainFailureTip'));

    const connectWallet = ethWalletRef.current?.getWallet();
    const provider = new ethers.providers.Web3Provider(connectWallet.provider);

    // eslint-disable-next-line no-unused-vars
    const signer = provider.getSigner();
    const messages = 'all your base are belong to you.';
    const contract = new ethers.Contract(contractAddress, NFTContract.abi, signer);
    try {
      const signature = await signer.signMessage(messages);
      const receipt = await contract.mint(signature);
      // adjust DID Wallet Auth
      await onSuccessAuth([{}, { txHash: receipt.hash }]);
      await receipt.wait();
    } catch (err) {
      console.error(err);
    }
  };

  // use DID Wallet Auth
  const openAuthDialog = async () => {
    const i18nKey = 'mint';

    const defaultParams = {
      chainId: state.chainId,
      contractAddress,
    };

    const nextUrl = new URL(window.location.href);
    // pathname is mint-nft
    nextUrl.pathname = joinUrl(window?.env?.apiPrefix ?? '/', '/api/did/mint-nft/token');
    // map defaultParams to query
    Object.keys(defaultParams).forEach((key) => {
      nextUrl.searchParams.append(key, defaultParams[key]);
    });

    authRef.current.open({
      action: 'sign-message',
      params: {
        ...defaultParams,
        nwUrl: nextUrl.href,
      },
      messages: {
        title: t(`${i18nKey}.auth.title`),
        scan: t(`${i18nKey}.auth.scan`),
        confirm: t(`${i18nKey}.auth.confirm`),
        success: t(`${i18nKey}.auth.success`),
      },
      onSuccessAuth,
    });
  };

  const handleMint = async () => {
    const wallet = ethWalletRef.current?.getWallet();

    if (!wallet) {
      const connectedList = await ethWalletRef.current?.open?.();
      if (!connectedList?.length) return; // use DID Wallet, trigger wallet Module onclick
    }

    await openAuthDialogOtherWallet(wallet);
  };
  const startTime = 1689260400;
  const endTime = 1691938800;
  let mintable = false;
  // 在时间范围内，可以 mint
  if (Date.now() / 1000 > startTime && Date.now() / 1000 < endTime) {
    mintable = true;
  }

  const explorerUrl = getExplorerUrl({ explorer, value: contractAddress, type: 'address' });
  const introProps = {
    key: 'intro',
    isMobile,
    name: 'Base is for builders',
    chainInfo: (
      <div className="flex items-center mr-1">
        {IconAvatar && <IconAvatar />}
        <span className="ml-2 ">{chainName}</span>
        {isTest && (
          <StyledBadge className="!mb-0 !ml-2" fontSize="small">
            {t('common.betaChain')}
          </StyledBadge>
        )}
      </div>
    ),
    price: t('common.free'),
    startTime: formatTime(startTime),
    endTime: formatTime(endTime),
    contractAddress: explorerUrl && (
      <div className="flex items-center">
        <DidAddress
          key="address"
          className="max-w-200px mr-0.5"
          prepend={<DidAvatar className="mr-2" did={contractAddress} size={24} />}>
          {contractAddress}
        </DidAddress>
        <IconButton
          size="small"
          href={explorerUrl}
          sx={{
            marginRight: '-5px',
          }}
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
          }}>
          <ExploreIcon fontSize="14px" />
        </IconButton>
      </div>
    ),
    display: 'https://images.mirror-media.xyz/publication-images/Zm87s2zqqYkuGh3zZ_U4d.gif',
    description:
      'Base is by builders, for builders.\nWhen you combine new ideas and technology with brilliant people, you create an unwavering force for good in the world: builders. Builders are the tinkerers, the curious, the ones who live in, see, and create the future.',
    actions: [
      <Button
        key="mint"
        disabled={!mintable || isLoading}
        sx={{
          textTransform: 'none',
        }}
        className="w-full"
        color="primary"
        {...(isSuccess
          ? {
              href: state.txUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
              variant: 'outlined',
              startIcon: '🎉',
              color: 'success',
            }
          : {
              onClick: handleMint,
              variant: 'contained',
            })}>
        {isSuccess ? t('common.mintSuccess') : t('common.mint')}
      </Button>,
    ],
  };

  return (
    <div className={classes.container}>
      <LottieAnimation
        style={{
          position: 'fixed',
          height: '100vh',
          width: '100vw',
          top: 0,
          left: 0,
          background: isLoading && 'rgba(0, 0, 0, 0.2)',
          zIndex: 999,
          pointerEvents: isLoading ? 'auto' : 'none',
          transition: 'all 0.3s ease-in-out',
        }}
        loop={!isSuccess}
        animationData={state.animationData}
        ref={lottieAnimationRef}
        onComplete={() => {}}
      />
      <div
        className={classes.messages}
        style={{
          minHeight: '400px',
          alignItems: 'center',
          justifyContent: 'center',
          display: 'flex',
          overflowY: 'hidden',
        }}>
        <NFTIntro {...introProps} />
      </div>

      <ETHWallet
        ref={ethWalletRef}
        theme={theme}
        getDIDWalletProps={() => {
          return {
            onClick: openAuthDialog,
          };
        }}
        // filterWallet={(walletList) => [walletList[0]]} // only use DID Wallet
      />
      <AuthDialog ref={authRef} popup />
    </div>
  );
}

export default Home;

const StyledBadge = styled(Badge)`
  margin-left: 0.3rem !important;
  margin-bottom: 0.3rem !important;
  background: ${(props) => {
    return props.theme.palette.primary.main;
  }} !important;
`;

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  messages: {
    flex: '1',
    overflowY: 'auto',
    margin: '16px 0',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    bottom: 16,
    background: '#fff',
  },
  inputField: {
    flexGrow: '1',
  },
  button: {},
}));
