import { expect, test } from "bun:test";
import { blockByTime } from "../../src/utils/scan";

function makeFetchMock(body: unknown): typeof fetch {
    const fn = async (_input: string) =>
        new Response(JSON.stringify(body));
    (fn as any).preconnect = async () => { };
    return fn as unknown as typeof fetch;
}

const ok = (num: string) => makeFetchMock({ status: "1", message: "OK", result: num });
const fail = (msg: string) => makeFetchMock({ status: "0", message: msg, result: "" });

test("returns block number on success", async () => {
    const blk = await blockByTime(
        "https://api",
        "KEY",
        1_700_000_000,
        "before",
        ok("123456"),
    );
    expect(blk).toBe(123456);
});

test("throws on API error", async () => {
    await expect(
        blockByTime(
            "https://api",
            "KEY",
            1,
            "after",
            fail("rate limit"),
        ),
    ).rejects.toThrow("rate limit");
});
