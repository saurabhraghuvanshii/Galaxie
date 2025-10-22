import { NextRequest, NextResponse } from 'next/server';
import { getVideosByWalletAddress } from '@/app/lib/types/database';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ walletAddress: string }> }
) {
    try {
        const { walletAddress } = await params;
        const videos = await getVideosByWalletAddress(walletAddress);
        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching user videos:', error);
        return NextResponse.json({ error: 'Failed to fetch user videos' }, { status: 500 });
    }
}
