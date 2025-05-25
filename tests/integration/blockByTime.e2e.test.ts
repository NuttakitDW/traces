import { expect, test } from "bun:test";
import { blockByTime } from "../../src/utils/scan";
import { CHAINS } from "../../src/config/chains";
import "dotenv/config";

const { api, apiKeyEnv } = CHAINS.ethereum;
const apiKey = process.env[apiKeyEnv];

const maybe = apiKey ? test : test.skip;

maybe("blockByTime hits Etherscan and returns a plausible block", async () => {
    const ts = 1735689600;

    const blk = await blockByTime(api, apiKey!, ts, "before");
    console.log("block number:", blk);

    expect(blk).toBeGreaterThan(19_000_000);
});
