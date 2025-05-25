import { serve } from "bun";
import "dotenv/config";
import { handle as transactionsRouteHandler } from "./routes/transactions";

const portNumber = Number(process.env.PORT) || 3000;

const server = serve({
    port: portNumber,
    async fetch(request) {
        const requestPath = new URL(request.url).pathname;
        if (requestPath.startsWith("/transactions/")) {
            return transactionsRouteHandler(request);
        }
        return new Response("traces service", { status: 200 });
    },
});

console.log(`Server running at http://localhost:${server.port}`);