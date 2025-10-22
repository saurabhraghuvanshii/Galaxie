import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { username },
            select: {
                id: true,
                wallet_address: true,
                username: true,
                display_name: true,
                bio: true,
                avatar_url: true,
                joined_date: true,
                created_at: true,
                updated_at: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user by username:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
