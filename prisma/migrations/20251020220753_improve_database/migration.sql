/*
  Warnings:

  - You are about to drop the column `blockNumber` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `confirmedAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `fromAddress` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `solAmount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `toAddress` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `buyerId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `isCompleted` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `solAmount` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `transactionHash` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `videoId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `isLive` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `solPrice` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `viewCount` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `videos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transaction_hash]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[video_id,buyer_id]` on the table `purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[wallet_address]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `from_address` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sol_amount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_address` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_hash` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyer_id` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sol_amount` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `video_id` to the `purchases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_address` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_address` to the `videos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `youtube_url` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."purchases" DROP CONSTRAINT "purchases_buyerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."purchases" DROP CONSTRAINT "purchases_videoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."videos" DROP CONSTRAINT "videos_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."payments_transactionHash_key";

-- DropIndex
DROP INDEX "public"."purchases_videoId_buyerId_key";

-- DropIndex
DROP INDEX "public"."users_walletAddress_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "blockNumber",
DROP COLUMN "confirmedAt",
DROP COLUMN "createdAt",
DROP COLUMN "fromAddress",
DROP COLUMN "solAmount",
DROP COLUMN "toAddress",
DROP COLUMN "transactionHash",
ADD COLUMN     "block_number" BIGINT,
ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "from_address" TEXT NOT NULL,
ADD COLUMN     "sol_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "to_address" TEXT NOT NULL,
ADD COLUMN     "transaction_hash" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "buyerId",
DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "isCompleted",
DROP COLUMN "solAmount",
DROP COLUMN "transactionHash",
DROP COLUMN "videoId",
ADD COLUMN     "buyer_id" TEXT NOT NULL,
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sol_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transaction_hash" TEXT,
ADD COLUMN     "video_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "walletAddress",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wallet_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "videos" DROP COLUMN "createdAt",
DROP COLUMN "isLive",
DROP COLUMN "isPaid",
DROP COLUMN "ownerId",
DROP COLUMN "solPrice",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "updatedAt",
DROP COLUMN "viewCount",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_live" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sol_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnail_url" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wallet_address" TEXT NOT NULL,
ADD COLUMN     "youtube_url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_hash_key" ON "payments"("transaction_hash");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_video_id_buyer_id_key" ON "purchases"("video_id", "buyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
