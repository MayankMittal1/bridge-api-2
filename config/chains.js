const chains = [
  {
    chainName: "Polygon",
    lzChainId: 109,
    rpc: "https://polygon-mainnet.g.alchemy.com/v2/demo",
    chainId: 137,
    unmarshallName: "matic",
  },
  {
    chainName: "Arbitrum",
    lzChainId: 110,
    chainId: 42161,
    rpc: "https://rpc.arb1.arbitrum.gateway.fm",
    unmarshallName: "arbitrum",
  },
  {
    chainName: "Optimism",
    lzChainId: 111,
    rpc: "https://opt-mainnet.g.alchemy.com/v2/demo",
    chainId: 10,
    unmarshallName: "optimism",
  },
];

module.exports = chains;
