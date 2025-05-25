import { CHAINS } from "../config/chains";
import { parseISO, startOfDay, endOfDay, getUnixTime } from "date-fns";
import { blockByTime } from "../utils/scan";
import { fetch as undiciFetch } from "undici";
import type { ScanTransactionResponse } from "../types/scan";

export async function fetchEthereumTransactionsByDate(
    dateISO: string,
    walletAddress: string,
    blockByTimeFunction = blockByTime,
    fetchFunction: typeof undiciFetch = undiciFetch,
) {
    const { api: apiEndpoint, apiKeyEnv: apiKeyEnvironmentVariable } = CHAINS.ethereum;
    const apiKey = process.env[apiKeyEnvironmentVariable]!;
    const startTimestamp = getUnixTime(startOfDay(parseISO(dateISO)));
    const endTimestamp = getUnixTime(endOfDay(parseISO(dateISO)));

    const startBlock = await blockByTimeFunction(apiEndpoint, apiKey, startTimestamp, "before");
    const endBlock = await blockByTimeFunction(apiEndpoint, apiKey, endTimestamp, "after");

    let currentPage = 1;
    let transactions: any[] = [];
    while (true) {
        const requestUrl =
            `${apiEndpoint}?module=account&action=txlist`
            + `&address=${walletAddress}&startblock=${startBlock}&endblock=${endBlock}`
            + `&page=${currentPage}&offset=1000&sort=asc&apikey=${apiKey}`;

        const response = await fetchFunction(requestUrl)
            .then(res => res.json()) as ScanTransactionResponse;

        if (response.status !== "1" || response.result.length === 0) break;
        transactions.push(...response.result);
        if (response.result.length < 1000) break;
        currentPage++;
    }
    return transactions;
}
