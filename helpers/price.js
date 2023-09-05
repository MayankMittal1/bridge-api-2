const axios = require("axios");

const fetchTokenPrice = async (tokenId) => {
  const response = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
  );
  return parseFloat(response.data[`${tokenId}`].usd);
};

module.exports = { fetchTokenPrice };
