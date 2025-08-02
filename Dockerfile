FROM oven/bun:1.1

WORKDIR /app

COPY bun.lock package.json tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN bun install
RUN bunx prisma generate

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
