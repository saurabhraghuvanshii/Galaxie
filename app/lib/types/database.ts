import { db } from '../db';
import { VideoCreateSchema, VideoUpdateSchema, UserCreateSchema, PurchaseCreateSchema } from './index';
import { z } from 'zod';

// Video operations
export async function createVideo(data: z.infer<typeof VideoCreateSchema>) {
    return await db.video.create({
        data: data,
    });
}

export async function getVideos() {
    return await db.video.findMany({
        orderBy: { created_at: 'desc' },
    });
}

export async function getVideoById(id: string) {
    return await db.video.findUnique({
        where: { id },
    });
}

export async function getVideosByWalletAddress(walletAddress: string) {
    return await db.video.findMany({
        where: { wallet_address: walletAddress },
        orderBy: { created_at: 'desc' },
    });
}

export async function updateVideo(id: string, data: z.infer<typeof VideoUpdateSchema>) {
    const validatedData = VideoUpdateSchema.parse(data);
    return await db.video.update({
        where: { id },
        data: validatedData,
    });
}

export async function deleteVideo(id: string) {
    return await db.video.delete({
        where: { id },
    });
}

// User operations
export async function createUser(data: z.infer<typeof UserCreateSchema>) {
    const validatedData = UserCreateSchema.parse(data);
    return await db.user.upsert({
        where: { wallet_address: validatedData.wallet_address },
        update: validatedData,
        create: validatedData,
    });
}

export async function getUserByWalletAddress(walletAddress: string) {
    return await db.user.findUnique({
        where: { wallet_address: walletAddress },
    });
}

// Purchase operations
export async function createPurchase(data: z.infer<typeof PurchaseCreateSchema>) {
    const validatedData = PurchaseCreateSchema.parse(data);
    return await db.purchase.create({
        data: validatedData,
    });
}

export async function getPurchasesByBuyer(buyerWalletAddress: string) {
    return await db.purchase.findMany({
        where: { buyer_wallet_address: buyerWalletAddress },
        include: { video: true },
        orderBy: { created_at: 'desc' },
    });
}

export async function getPurchaseByVideoAndBuyer(videoId: string, buyerWalletAddress: string) {
    return await db.purchase.findUnique({
        where: {
            video_id_buyer_wallet_address: {
                video_id: videoId,
                buyer_wallet_address: buyerWalletAddress,
            },
        },
    });
}

// Purchase operations (consolidated payment tracking)
export async function getPurchaseByTransactionSignature(transactionSignature: string) {
    return await db.purchase.findUnique({
        where: { transaction_signature: transactionSignature },
    });
}

export async function updatePurchaseStatus(id: string, status: string, completedAt?: Date) {
    return await db.purchase.update({
        where: { id },
        data: {
            status,
            completed_at: completedAt,
        },
    });
}

export async function getPurchasesByCreator(creatorWalletAddress: string) {
    return await db.purchase.findMany({
        where: { creator_wallet_address: creatorWalletAddress },
        include: { video: true },
        orderBy: { created_at: 'desc' },
    });
}

export async function getPurchaseById(id: string) {
    return await db.purchase.findUnique({
        where: { id },
        include: { video: true, buyer: true },
    });
}

export async function getAllPurchases() {
    return await db.purchase.findMany({
        include: { video: true, buyer: true },
        orderBy: { created_at: 'desc' },
    });
}

export async function getPurchasesByStatus(status: string) {
    return await db.purchase.findMany({
        where: { status },
        include: { video: true, buyer: true },
        orderBy: { created_at: 'desc' },
    });
}
