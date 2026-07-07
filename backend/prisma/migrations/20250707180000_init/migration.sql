-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Impact" AS ENUM ('Bullish', 'Bearish', 'Neutral');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "sector" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "raw_content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "impact" "Impact" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "expected_move" TEXT NOT NULL,
    "holding_period" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_symbol_key" ON "companies"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "news_url_key" ON "news"("url");

-- CreateIndex
CREATE INDEX "news_company_id_idx" ON "news"("company_id");

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "news"("published_at" DESC);

-- CreateIndex
CREATE INDEX "news_source_idx" ON "news"("source");

-- CreateIndex
CREATE UNIQUE INDEX "events_news_id_key" ON "events"("news_id");

-- CreateIndex
CREATE INDEX "events_company_id_idx" ON "events"("company_id");

-- CreateIndex
CREATE INDEX "events_impact_idx" ON "events"("impact");

-- CreateIndex
CREATE INDEX "events_created_at_idx" ON "events"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "scores_company_id_key" ON "scores"("company_id");

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
