import { expect, test } from "bun:test";
import "dotenv/config";
import { fetchEthereumTransactionsByDate } from "../../src/services/ethereum";
import { CHAINS } from "../../src/config/chains";

const { apiKeyEnv } = CHAINS.ethereum;
const apiKey = process.env[apiKeyEnv];

const maybe = apiKey ? test : test.skip;

maybe("fetches real transactions for a known wallet on a given day", async () => {
    const isoDate = "2025-05-01";
    const walletAddress = "0xdadB0d80178819F2319190D340ce9A924f783711";

    const transactions = await fetchEthereumTransactionsByDate(isoDate, walletAddress);

    console.log(`integration — fetched ${transactions.length} transactions`);
    expect(transactions.length).toBeGreaterThan(0);
});
