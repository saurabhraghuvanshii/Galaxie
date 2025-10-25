import { NextRequest, NextResponse } from 'next/server';
import {
    createSolanaConnection,
    createPaymentTransaction,
    verifyTransaction,
    solToLamports,
    createKeypairFromPrivateKey,
    type PaymentRequest
} from '@/app/lib/solana-payment';
import { PublicKey } from '@solana/web3.js';
import { db } from '@/app/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            buyerPrivateKey,
            creatorWalletAddress,
            amount,
            feePercent = 5,
            videoId
        } = body;

        // Validate required fields
        if (!buyerPrivateKey || !creatorWalletAddress || !amount || !videoId) {
            return NextResponse.json({
                error: 'Missing required fields: buyerPrivateKey, creatorWalletAddress, amount, videoId'
            }, { status: 400 });
        }

        // Validate amount
        if (amount <= 0) {
            return NextResponse.json({
                error: 'Amount must be greater than 0'
            }, { status: 400 });
        }

        // Validate fee percent
        if (feePercent < 0 || feePercent > 100) {
            return NextResponse.json({
                error: 'Fee percent must be between 0 and 100'
            }, { status: 400 });
        }

        // Create Solana connection
        const connection = createSolanaConnection();

        // Create buyer keypair from private key
        const buyerKeypair = createKeypairFromPrivateKey(buyerPrivateKey);

        // Convert amount to lamports
        const amountInLamports = solToLamports(amount);

        // Create payment request
        const paymentRequest: PaymentRequest = {
            buyerKeypair,
            creatorPublicKey: new PublicKey(creatorWalletAddress),
            totalAmount: amountInLamports,
            feePercent,
            videoId,
        };

        // Process payment
        const paymentResult = await createPaymentTransaction(connection, paymentRequest);

        if (!paymentResult.success) {
            return NextResponse.json({
                error: paymentResult.error || 'Payment failed'
            }, { status: 400 });
        }

        // Verify transaction
        if (paymentResult.transactionSignature) {
            const isVerified = await verifyTransaction(connection, paymentResult.transactionSignature);
            if (!isVerified) {
                return NextResponse.json({
                    error: 'Transaction verification failed'
                }, { status: 400 });
            }
        }

        // Update video purchase record in database
        try {
            await db.purchase.create({
                data: {
                    video_id: videoId,
                    buyer_wallet_address: buyerKeypair.publicKey.toString(),
                    creator_wallet_address: creatorWalletAddress,
                    amount_paid: BigInt(amountInLamports),
                    platform_fee: BigInt(paymentResult.platformFee),
                    creator_payout: BigInt(paymentResult.creatorPayout),
                    transaction_signature: paymentResult.transactionSignature || '',
                    status: 'completed',
                    completed_at: new Date(),
                },
            });
        } catch (dbError) {
            console.error('Failed to save purchase record:', dbError);
            // Don't fail the payment if database save fails
        }

        return NextResponse.json({
            success: true,
            transactionSignature: paymentResult.transactionSignature,
            platformFee: paymentResult.platformFee,
            creatorPayout: paymentResult.creatorPayout,
            platformFeeSOL: paymentResult.platformFee / 1000000000,
            creatorPayoutSOL: paymentResult.creatorPayout / 1000000000,
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');
        const buyerWallet = searchParams.get('buyerWallet');

        if (!videoId || !buyerWallet) {
            return NextResponse.json({
                error: 'Missing videoId or buyerWallet parameter'
            }, { status: 400 });
        }

        // Check if purchase exists
        const purchase = await db.purchase.findFirst({
            where: {
                video_id: videoId,
                buyer_wallet_address: buyerWallet,
            },
        });

        return NextResponse.json({
            hasPurchased: !!purchase,
            purchase: purchase ? {
                transactionSignature: purchase.transaction_signature,
                amountPaid: purchase.amount_paid,
                createdAt: purchase.created_at,
            } : null,
        });

    } catch (error) {
        console.error('Error checking purchase status:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}
