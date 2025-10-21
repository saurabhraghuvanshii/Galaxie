import { z } from "zod";

// User schemas
export const UserCreateSchema = z.object({
    wallet_address: z.string().min(1, "Wallet address is required"),
    username: z.string().optional(),
    email: z.string().email().optional(),
    avatar: z.string().url().optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial();

export const UserSchema = UserCreateSchema.extend({
    id: z.string(),
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
    buyer_id: z.string().min(1, "Buyer ID is required"),
    sol_amount: z.number().min(0, "Amount must be non-negative"),
    transaction_hash: z.string().optional(),
    is_completed: z.boolean().default(false),
});

export const PurchaseUpdateSchema = PurchaseCreateSchema.partial();

export const PurchaseSchema = PurchaseCreateSchema.extend({
    id: z.string(),
    created_at: z.date(),
    completed_at: z.date().optional(),
});

// Payment schemas
export const PaymentCreateSchema = z.object({
    from_address: z.string().min(1, "From address is required"),
    to_address: z.string().min(1, "To address is required"),
    sol_amount: z.number().min(0, "Amount must be non-negative"),
    transaction_hash: z.string().min(1, "Transaction hash is required"),
    status: z.enum(["pending", "completed", "failed"]).default("pending"),
    block_number: z.number().int().optional(),
});

export const PaymentUpdateSchema = PaymentCreateSchema.partial();

export const PaymentSchema = PaymentCreateSchema.extend({
    id: z.string(),
    created_at: z.date(),
    confirmed_at: z.date().optional(),
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

export type Payment = z.infer<typeof PaymentSchema>;
export type PaymentCreate = z.infer<typeof PaymentCreateSchema>;
export type PaymentUpdate = z.infer<typeof PaymentUpdateSchema>;