FROM oven/bun:1.1

WORKDIR /app

COPY . .

RUN bun install
RUN bunx prisma generate
RUN bunx prisma db push

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
