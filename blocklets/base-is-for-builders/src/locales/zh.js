import flat from 'flat';

export default flat({
  common: {
    betaChain: '测试链',
    setChainFailureTip: '切换链失败，请重试',
    useDIDWallet: 'DID Wallet',
    cancel: '取消',
    confirm: '确认',
    unknownError: '未知错误',
    chain: '链',
    contractAddress: '合约地址',
    price: '价格',
    startTime: '开始时间',
    endTime: '结束时间',
    free: '免费 ( 只需支付 Gas Fee )',
    mint: '立即铸造',
    mintSuccess: '铸造成功，点击前往区块浏览器中查看',
  },
  mint: {
    auth: {
      title: '确认铸造 NFT',
      scan: '使用您的 DID Wallet 扫描下面的二维码以完成 NFT 铸造',
      confirm: '使用 DID Wallet 确认',
      success: '成功',
    },
  },
});
