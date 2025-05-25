import { expect, test } from "bun:test";
import { blockByTime } from "../../src/utils/scan";

function createFetchMock(responseBody: unknown): typeof fetch {
    const fetchMockFunction = async (_input: string) =>
        new Response(JSON.stringify(responseBody));
    (fetchMockFunction as any).preconnect = async () => { };
    return fetchMockFunction as unknown as typeof fetch;
}

const createSuccessfulResponse = (blockNumber: string) =>
    createFetchMock({ status: "1", message: "OK", result: blockNumber });

const createFailureResponse = (errorMessage: string) =>
    createFetchMock({ status: "0", message: errorMessage, result: "" });

test("returns block number on success", async () => {
    const blockNumber = await blockByTime(
        "https://api",
        "KEY",
        1_700_000_000,
        "before",
        createSuccessfulResponse("123456"),
    );
    expect(blockNumber).toBe(123456);
});

test("throws on API error", async () => {
    await expect(
        blockByTime(
            "https://api",
            "KEY",
            1,
            "after",
            createFailureResponse("rate limit"),
        ),
    ).rejects.toThrow("rate limit");
});
