import { expect, test } from "bun:test";
import { blockByTime } from "../../src/utils/scan";
import { CHAINS } from "../../src/config/chains";
import "dotenv/config";

const { api: ethereumApi, apiKeyEnv: ethereumApiKeyEnv } = CHAINS.ethereum;
const ethereumApiKey = process.env[ethereumApiKeyEnv];

const testToRun = ethereumApiKey ? test : test.skip;

testToRun("blockByTime hits Etherscan and returns a plausible block", async () => {
    const timestamp = 1735689600;

    const blockNumber = await blockByTime(ethereumApi, ethereumApiKey!, timestamp, "before");
    console.log("block number:", blockNumber);

    expect(blockNumber).toBeGreaterThan(19_000_000);
});
