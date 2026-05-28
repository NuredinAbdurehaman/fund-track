-- CreateTable
CREATE TABLE "category_share_links" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "category_share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_shares" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_share_links_owner_id_idx" ON "category_share_links"("owner_id");

-- CreateIndex
CREATE INDEX "category_share_links_token_hash_idx" ON "category_share_links"("token_hash");

-- CreateIndex
CREATE INDEX "category_shares_recipient_id_idx" ON "category_shares"("recipient_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_shares_owner_id_category_recipient_id_key" ON "category_shares"("owner_id", "category", "recipient_id");
