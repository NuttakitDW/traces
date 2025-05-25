import { isIsoDate, isEvmAddress } from "../utils/validators";
import { fetchEthereumTransactionsByDate } from "../services/ethereum";

const SERVICE_MAP = {
    ethereum: fetchEthereumTransactionsByDate,
} as const;

export async function handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const chainKey = url.pathname.split("/")[2];
    const isoDate = url.searchParams.get("date");
    const walletAddress = url.searchParams.get("address");

    if (!chainKey || !isoDate || !walletAddress || !isIsoDate(isoDate) || !isEvmAddress(walletAddress)) {
        return new Response("Bad request", { status: 400 });
    }

    const service = SERVICE_MAP[chainKey as keyof typeof SERVICE_MAP];
    if (!service) {
        return new Response("Unsupported chain", { status: 400 });
    }

    try {
        const transactions = await service(isoDate, walletAddress);
        return Response.json({ count: transactions.length, transactions });
    } catch (error) {
        return new Response((error as Error).message, { status: 500 });
    }
}
