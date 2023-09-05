const chains = require("./chains");
const coins = require("./coins");
const bridgeConfig = require("./bridge");

const createAppConfig = (bridgeConfig, chainConfig, tokenConfig) => {
  let wrappedTokens = [];
  if (bridgeConfig.tokens.length > 0) {
    tokenConfig.coins.forEach((coin) => {
      const token = bridgeConfig.tokens
        .find((token) => token[0].symbol === coin.symbol)
        ?.find((token) => token.chainId === bridgeConfig.fuse.chainId);
      if (token) {
        wrappedTokens.push({
          ...token,
          icon: coin.icon,
        });
      }
    });
  }
  return {
    wrappedBridge: {
      version: bridgeConfig.version,
      fuse: {
        lzChainId: bridgeConfig.fuse.chainId,
        wrapped: bridgeConfig.fuse.wrapped,
        tokens: wrappedTokens,
      },
      chains: chainConfig.chains.map((chain) => {
        let tokens = [];
        if (bridgeConfig.tokens.length > 0) {
          tokenConfig.coins.forEach((coin) => {
            const token = bridgeConfig.tokens
              .find((token) => token[0].symbol === coin.symbol)
              ?.find((token) => token.chainId === chain.lzChainId);
            if (token) {
              tokens.push({
                address: token.address,
                decimals: token.decimals,
                name: token.name,
                symbol: token.symbol,
                icon: coin.icon,
                isNative: token.isNative,
                isBridged: token.isBridged,
              });
            }
          });
        }
        return {
          chainId: chain.chainId,
          lzChainId: chain.lzChainId,
          name: chain.chainName,
          icon: chain.icon,
          original: bridgeConfig.original.find(
            (bridge) => bridge.chainId === chain.lzChainId
          )?.address,
          wrapped: bridgeConfig.wrapped.find(
            (bridge) => bridge.chainId === chain.lzChainId
          )?.address,
          originalFuse: bridgeConfig.originalFuse.find(
            (bridge) => bridge.chainId === chain.lzChainId
          )?.address,
          tokens: tokens,
          rpcUrl: chain.rpc,
          unmarshallName: chain.unmarshallName,
        };
      }),
    },
  };
};

const createCoinConfig = (config) => {
  return {
    coins: config,
  };
};

const createChainConfig = (config) => {
  return {
    chains: config,
  };
};

const chainConfig = createChainConfig(chains);
const coinConfig = createCoinConfig(coins);
const appConfig = createAppConfig(bridgeConfig, chainConfig, coinConfig);

module.exports = appConfig;
