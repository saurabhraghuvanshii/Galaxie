import { z } from "zod";

// User schemas
export const UserCreateSchema = z.object({
    wallet_address: z.string().min(1, "Wallet address is required"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(15, "Username must be 15 characters or less")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .optional(),
    display_name: z.string().max(50, "Display name must be less than 50 characters").optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    avatar_url: z.string().optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial();

export const UserSchema = UserCreateSchema.extend({
    id: z.string(),
    joined_date: z.date(),
    created_at: z.date(),
    updated_at: z.date(),
});

// Video schemas
export const VideoCreateSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    youtube_url: z.string().url("Invalid YouTube URL"),
    thumbnail_url: z.string().optional(),
    sol_price: z.number().min(0, "Price must be non-negative").default(0),
    is_paid: z.boolean().default(false),
    is_live: z.boolean().default(false),
    wallet_address: z.string().min(1, "Wallet address is required"),
});

export const VideoUpdateSchema = VideoCreateSchema.partial();

export const VideoSchema = VideoCreateSchema.extend({
    id: z.string(),
    created_at: z.date(),
    updated_at: z.date(),
});

// Purchase schemas
export const PurchaseCreateSchema = z.object({
    video_id: z.string().min(1, "Video ID is required"),
    buyer_wallet_address: z.string().min(1, "Buyer wallet address is required"),
    creator_wallet_address: z.string().min(1, "Creator wallet address is required"),
    amount_paid: z.bigint().min(BigInt(0), "Amount paid must be non-negative"),
    platform_fee: z.bigint().min(BigInt(0), "Platform fee must be non-negative"),
    creator_payout: z.bigint().min(BigInt(0), "Creator payout must be non-negative"),
    transaction_signature: z.string().min(1, "Transaction signature is required"),
    status: z.string().default("completed"),
    block_number: z.number().int().optional(),
    buyer_id: z.string().optional(),
});

export const PurchaseUpdateSchema = PurchaseCreateSchema.partial();

export const PurchaseSchema = PurchaseCreateSchema.extend({
    id: z.string(),
    created_at: z.date(),
    completed_at: z.date().optional(),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export type Video = z.infer<typeof VideoSchema>;
export type VideoCreate = z.infer<typeof VideoCreateSchema>;
export type VideoUpdate = z.infer<typeof VideoUpdateSchema>;

export type Purchase = z.infer<typeof PurchaseSchema>;
export type PurchaseCreate = z.infer<typeof PurchaseCreateSchema>;
export type PurchaseUpdate = z.infer<typeof PurchaseUpdateSchema>;