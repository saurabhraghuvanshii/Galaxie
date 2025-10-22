import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { UserUpdateSchema } from '@/app/lib/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('wallet_address');

        if (!walletAddress) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }

        let user = await db.user.findUnique({
            where: { wallet_address: walletAddress },
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
            user = await db.user.create({
                data: {
                    wallet_address: walletAddress,
                },
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
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = UserUpdateSchema.parse(body);

        const { wallet_address, ...updateData } = validatedData;

        if (!wallet_address) {
            return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
        }

        // Check if user exists, create if not
        let user = await db.user.findUnique({
            where: { wallet_address }
        });

        if (!user) {
            user = await db.user.create({
                data: {
                    wallet_address,
                    ...updateData
                }
            });
        } else {
            user = await db.user.update({
                where: { wallet_address },
                data: updateData
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error updating user profile:', error);

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation error', details: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
