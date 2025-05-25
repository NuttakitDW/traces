import { fetchEthereumTransactionsByDate } from "../services/ethereum";
import { fetchPolygonTransactionsByDate } from "../services/polygon";

const SERVICE_MAP = {
    ethereum: fetchEthereumTransactionsByDate,
} as const;

export async function handle(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    const [, , chainKey, isoDate, walletAddress] = pathname.split("/");

    if (!chainKey || !isoDate || !walletAddress) {
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
