-- CreateTable
CREATE TABLE "SMTTCursor" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'smtt_default',
    "updatedSince" TEXT,
    "lastUpdate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
