const express = require("express");
const router = express.Router();
const { fetchTransactions } = require("../helpers/unmarshall");
const appConfig = require("../config/config");
const app = require("../app");
const { formatUnits } = require("ethers");
const { fetchTokenPrice } = require("../helpers/price");

const MIN_VALUE_IN_USD = 20;
const FUSE_CONSENSUS_ADDRESS = "0x3014ca10b91cb3D0AD85fEf7A3Cb95BCAc9c0f79";

router.get("/", (req, res, next) => {
  res.json({ message: "Fuse Bridge APIs" });
});

router.get("/checkUserBridgeStatus", async (req, res, next) => {
  const startTimestamp = parseInt(process.env.START_TIMESTAMP);
  const endTimestamp = parseInt(process.env.END_TIMESTAMP);
  const { wallet } = req.query;
  let transactions = [];
  for (const chain of appConfig.wrappedBridge.chains) {
    let chainTransactions = [];
    let response = await fetchTransactions(chain.unmarshallName, wallet);
    chainTransactions = chainTransactions.concat(response.transactions);
    while (response.has_next && chainTransactions.date > startTimestamp) {
      response = await fetchTransactions(
        chain.unmarshallName,
        wallet,
        response.page + 1
      );
      chainTransactions = chainTransactions.concat(response.transactions);
    }
    let filteredTransactions = chainTransactions.filter(
      (transaction) =>
        transaction.to == chain.original.toLowerCase() &&
        transaction.type == "send" &&
        transaction.date > startTimestamp &&
        transaction.date < endTimestamp
    );
    filteredTransactions = filteredTransactions.map((transaction) => {
      return transaction.sent[0].quote;
    });
    transactions = transactions.concat(filteredTransactions);

    const fusePrice = await fetchTokenPrice("fuse-network-token");
    let fuseTransactions = [];
    response = await fetchTransactions("fuse", wallet);
    fuseTransactions = fuseTransactions.concat(response.transactions);
    while (response.has_next && fuseTransactions.date > startTimestamp) {
      response = await fetchTransactions("fuse", wallet, response.page + 1);
      fuseTransactions = fuseTransactions.concat(response.transactions);
    }
    let filteredFuseTransactions = fuseTransactions.filter(
      (transaction) =>
        transaction.to == chain.originalFuse.toLowerCase() &&
        transaction.input_data.startsWith("0xc7e82ebd") &&
        transaction.date > startTimestamp &&
        transaction.date < endTimestamp
    );
    filteredFuseTransactions = filteredFuseTransactions.map((transaction) => {
      return fusePrice * formatUnits(BigInt(transaction.value), 18);
    });
    transactions = transactions.concat(filteredFuseTransactions);
  }
  if (Math.max(...transactions) >= MIN_VALUE_IN_USD) {
    res.status(200);
    res.json({ message: true });
  } else {
    res.status(200);
    res.json({ message: false });
  }
});

router.get("/checkUserStakeStatus", async (req, res, next) => {
  const startTimestamp = parseInt(process.env.START_TIMESTAMP);
  const endTimestamp = parseInt(process.env.END_TIMESTAMP);
  const { wallet } = req.query;
  const fusePrice = await fetchTokenPrice("fuse-network-token");
  let fuseTransactions = [];
  response = await fetchTransactions("fuse", wallet);
  fuseTransactions = fuseTransactions.concat(response.transactions);
  while (response.has_next && fuseTransactions.date > startTimestamp) {
    response = await fetchTransactions("fuse", wallet, response.page + 1);
    fuseTransactions = fuseTransactions.concat(response.transactions);
  }
  let filteredFuseTransactions = fuseTransactions.filter(
    (transaction) =>
      transaction.to == FUSE_CONSENSUS_ADDRESS.toLowerCase() &&
      transaction.input_data.startsWith("0x5c19a95c") &&
      transaction.date > startTimestamp &&
      transaction.date < endTimestamp
  );
  filteredFuseTransactions = filteredFuseTransactions.map((transaction) => {
    return fusePrice * formatUnits(BigInt(transaction.value), 18);
  });
  if (Math.max(...filteredFuseTransactions) >= MIN_VALUE_IN_USD) {
    res.status(200);
    res.json({ message: true });
  }
  res.status(200);
  res.json({ message: false });
});

module.exports = router;
