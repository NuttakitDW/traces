export async function blockByTime(
    api: string,
    apiKey: string,
    ts: number,
    closest: "before" | "after",
    fetchFn: typeof fetch = fetch,
): Promise<number> {
    const url =
        `${api}?module=block&action=getblocknobytime` +
        `&timestamp=${ts}&closest=${closest}&apikey=${apiKey}`;

    const res = await fetchFn(url);
    const json = (await res.json()) as {
        status: "0" | "1";
        message: string;
        result: string;
    };

    if (json.status !== "1") throw new Error(json.message || "blocknobytime error");
    return Number(json.result);
}
