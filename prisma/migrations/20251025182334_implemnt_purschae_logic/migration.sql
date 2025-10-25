/*
  Warnings:

  - You are about to drop the column `is_completed` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `sol_amount` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_hash` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transaction_signature]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[video_id,buyer_wallet_address]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount_paid` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_wallet_address` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_payout` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_wallet_address` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform_fee` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_signature` to the `purchases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."purchases" DROP CONSTRAINT "purchases_buyer_id_fkey";

-- DropIndex
DROP INDEX "public"."purchases_video_id_buyer_id_key";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "is_completed",
DROP COLUMN "sol_amount",
DROP COLUMN "transaction_hash",
ADD COLUMN     "amount_paid" BIGINT NOT NULL,
ADD COLUMN     "block_number" INTEGER,
ADD COLUMN     "buyer_wallet_address" TEXT NOT NULL,
ADD COLUMN     "creator_payout" BIGINT NOT NULL,
ADD COLUMN     "creator_wallet_address" TEXT NOT NULL,
ADD COLUMN     "platform_fee" BIGINT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'completed',
ADD COLUMN     "transaction_signature" TEXT NOT NULL,
ALTER COLUMN "buyer_id" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."payments";

-- CreateIndex
CREATE UNIQUE INDEX "purchases_transaction_signature_key" ON "purchases"("transaction_signature");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_video_id_buyer_wallet_address_key" ON "purchases"("video_id", "buyer_wallet_address");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
