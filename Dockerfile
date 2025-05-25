FROM oven/bun:1.2-slim

WORKDIR /app

COPY package.json tsconfig.json bun.lockb* ./

RUN bun install

COPY . .

EXPOSE 3000
CMD ["bun", "src/index.ts"]
