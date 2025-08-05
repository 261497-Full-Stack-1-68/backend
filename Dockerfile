FROM oven/bun:1.1

WORKDIR /app

COPY bun.lock package.json ./

RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]