import { db } from '../db';
import { VideoCreateSchema, VideoUpdateSchema, UserCreateSchema, PurchaseCreateSchema, PaymentCreateSchema } from './index';
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

export async function getPurchasesByBuyer(buyerId: string) {
    return await db.purchase.findMany({
        where: { buyer_id: buyerId },
        include: { video: true },
    });
}

export async function getPurchaseByVideoAndBuyer(videoId: string, buyerId: string) {
    return await db.purchase.findUnique({
        where: {
            video_id_buyer_id: {
                video_id: videoId,
                buyer_id: buyerId,
            },
        },
    });
}

// Payment operations
export async function createPayment(data: z.infer<typeof PaymentCreateSchema>) {
    const validatedData = PaymentCreateSchema.parse(data);
    return await db.payment.create({
        data: validatedData,
    });
}

export async function getPaymentByTransactionHash(transactionHash: string) {
    return await db.payment.findUnique({
        where: { transaction_hash: transactionHash },
    });
}

export async function updatePaymentStatus(id: string, status: string, confirmedAt?: Date) {
    return await db.payment.update({
        where: { id },
        data: {
            status,
            confirmed_at: confirmedAt,
        },
    });
}