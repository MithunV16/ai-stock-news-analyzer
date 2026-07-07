-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'skipped');

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "fingerprint" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" TEXT,
    "impact" TEXT,
    "confidence" INTEGER,
    "score" DOUBLE PRECISION,
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "ai_version" TEXT,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcements_fingerprint_key" ON "announcements"("fingerprint");

-- CreateIndex
CREATE INDEX "announcements_symbol_idx" ON "announcements"("symbol");

-- CreateIndex
CREATE INDEX "announcements_source_idx" ON "announcements"("source");

-- CreateIndex
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at" DESC);

-- CreateIndex
CREATE INDEX "announcements_processing_status_idx" ON "announcements"("processing_status");
