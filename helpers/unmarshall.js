const axios = require("axios");

const fetchTransactions = async (chain, address, page = 1) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      url: `https://api.unmarshal.com/v3/${chain}/address/${address}/transactions?page=${page}&pageSize=30&price=true&auth_key=${process.env.UNMARSHAL_API_KEY}`,
      headers: { accept: "application/json" },
    };

    axios
      .request(options)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        reject(error);
      });
  });
};

module.exports = { fetchTransactions };
