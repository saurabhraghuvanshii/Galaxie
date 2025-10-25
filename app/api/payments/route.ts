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
            buyerWalletAddress,
            creatorWalletAddress,
            amount,
            feePercent = 5,
            videoId,
            transactionSignature,
            isDemo = false
        } = body;

        // Validate required fields
        if (!buyerWalletAddress || !creatorWalletAddress || !amount || !videoId) {
            return NextResponse.json({
                error: 'Missing required fields: buyerWalletAddress, creatorWalletAddress, amount, videoId'
            }, { status: 400 });
        }

        // For demo mode, skip Solana transaction processing
        if (isDemo) {
            // Simulate successful payment
            const platformFee = Math.floor((amount * feePercent) / 100);
            const creatorPayout = amount - platformFee;
            const mockTransactionSignature = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Save to database (use upsert to handle duplicates)
            try {
                await db.purchase.upsert({
                    where: {
                        video_id_buyer_wallet_address: {
                            video_id: videoId,
                            buyer_wallet_address: buyerWalletAddress,
                        },
                    },
                    update: {
                        transaction_signature: mockTransactionSignature,
                        status: 'completed',
                        completed_at: new Date(),
                    },
                    create: {
                        video_id: videoId,
                        buyer_wallet_address: buyerWalletAddress,
                        creator_wallet_address: creatorWalletAddress,
                        amount_paid: BigInt(Math.floor(amount * 1000000000)), // Convert to lamports
                        platform_fee: BigInt(Math.floor(platformFee * 1000000000)),
                        creator_payout: BigInt(Math.floor(creatorPayout * 1000000000)),
                        transaction_signature: mockTransactionSignature,
                        status: 'completed',
                        completed_at: new Date(),
                    },
                });
            } catch (dbError) {
                console.error('Failed to save demo purchase record:', dbError);
            }

            return NextResponse.json({
                success: true,
                transactionSignature: mockTransactionSignature,
                platformFee: platformFee,
                creatorPayout: creatorPayout,
                platformFeeSOL: platformFee,
                creatorPayoutSOL: creatorPayout,
                isDemo: true
            });
        }

        // Real Solana transaction - verify the transaction signature
        if (!transactionSignature) {
            return NextResponse.json({
                error: 'Transaction signature required for real transactions'
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

        // Verify transaction on Solana devnet
        const connection = createSolanaConnection();
        const isVerified = await verifyTransaction(connection, transactionSignature);

        if (!isVerified) {
            return NextResponse.json({
                error: 'Transaction verification failed on Solana network'
            }, { status: 400 });
        }

        // Calculate fees
        const platformFee = Math.floor((amount * feePercent) / 100);
        const creatorPayout = amount - platformFee;

        // Save purchase record in database (use upsert to handle duplicates)
        try {
            await db.purchase.upsert({
                where: {
                    video_id_buyer_wallet_address: {
                        video_id: videoId,
                        buyer_wallet_address: buyerWalletAddress,
                    },
                },
                update: {
                    transaction_signature: transactionSignature,
                    status: 'completed',
                    completed_at: new Date(),
                },
                create: {
                    video_id: videoId,
                    buyer_wallet_address: buyerWalletAddress,
                    creator_wallet_address: creatorWalletAddress,
                    amount_paid: BigInt(Math.floor(amount * 1000000000)), // Convert to lamports
                    platform_fee: BigInt(Math.floor(platformFee * 1000000000)),
                    creator_payout: BigInt(Math.floor(creatorPayout * 1000000000)),
                    transaction_signature: transactionSignature,
                    status: 'completed',
                    completed_at: new Date(),
                },
            });
        } catch (dbError) {
            console.error('Failed to save purchase record:', dbError);
            return NextResponse.json({
                error: 'Failed to save purchase record'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            transactionSignature: transactionSignature,
            platformFee: platformFee,
            creatorPayout: creatorPayout,
            platformFeeSOL: platformFee,
            creatorPayoutSOL: creatorPayout,
            network: 'devnet'
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
                amountPaid: purchase.amount_paid.toString(),
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
