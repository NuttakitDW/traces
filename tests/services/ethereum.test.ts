import { test, expect } from "bun:test";
import { fetchEthereumTransactionsByDate } from "../../src/services/ethereum";
import { fetch as undiciFetch } from "undici";
import type { ScanTransactionResponse } from "../../src/types/scan";

function createFetchMock(pages: ScanTransactionResponse[]): typeof undiciFetch {
    let index = 0;
    const mock = async () =>
        new Response(JSON.stringify(pages[index++] ?? pages.at(-1))) as any;
    (mock as any).preconnect = async () => { };
    return mock as unknown as typeof undiciFetch;
}
async function constantBlockByTime() { return 123; }

test("aggregates multiple pages into one list", async () => {
    const fullPage: ScanTransactionResponse = {
        status: "1",
        message: "OK",
        result: Array.from({ length: 1000 }, (_, i) => ({ hash: `0xFULL${i}` })),
    };
    const tailPage: ScanTransactionResponse = {
        status: "1",
        message: "OK",
        result: [{ hash: "0xTAIL" }],
    };

    const transactions = await fetchEthereumTransactionsByDate(
        "2025-05-25",
        "0xdeadbeef",
        constantBlockByTime,
        createFetchMock([fullPage, tailPage]),
    );

    expect(transactions.length).toBe(1001);
    expect(transactions[0].hash).toBe("0xFULL0");
    expect(transactions.at(-1)?.hash).toBe("0xTAIL");
});

test("returns empty array when slice is empty", async () => {
    const empty: ScanTransactionResponse = {
        status: "0",
        message: "No result",
        result: [],
    };

    const transactions = await fetchEthereumTransactionsByDate(
        "2025-05-25",
        "0xdeadbeef",
        constantBlockByTime,
        createFetchMock([empty]),
    );

    expect(transactions.length).toBe(0);
});
