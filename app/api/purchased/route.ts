import { NextRequest, NextResponse } from 'next/server';
import { getPurchasesByBuyer } from '@/app/lib/types/database';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('wallet_address');

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        const purchases = await getPurchasesByBuyer(walletAddress);

        // Convert BigInt values to strings for JSON serialization
        const serializedPurchases = purchases.map(purchase => ({
            ...purchase,
            amount_paid: purchase.amount_paid.toString(),
            platform_fee: purchase.platform_fee.toString(),
            creator_payout: purchase.creator_payout.toString(),
        }));

        return NextResponse.json(serializedPurchases);
    } catch (error) {
        console.error('Error fetching purchased videos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch purchased videos' },
            { status: 500 }
        );
    }
}
