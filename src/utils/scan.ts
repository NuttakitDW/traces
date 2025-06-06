import type { ScanBlockByTimeResponse } from "../types/scan";

export async function blockByTime(
    apiUrl: string,
    apiAccessKey: string,
    timestamp: number,
    closestOption: "before" | "after",
    fetchFunction: typeof fetch = fetch,
): Promise<number> {
    const requestUrl =
        `${apiUrl}?module=block&action=getblocknobytime` +
        `&timestamp=${timestamp}&closest=${closestOption}&apikey=${apiAccessKey}`;

    const response = await fetchFunction(requestUrl);
    const jsonResponse = (await response.json()) as ScanBlockByTimeResponse;

    if (jsonResponse.status !== "1") {
        throw new Error(jsonResponse.message || "blocknobytime error");
    }
    return Number(jsonResponse.result);
}
