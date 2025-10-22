import { db } from '@/app/lib/db';

export interface UserDisplayInfo {
    displayName: string;
    username?: string;
    isUsername: boolean;
}

export async function getUserDisplayInfo(walletAddress: string): Promise<UserDisplayInfo> {
    try {
        const user = await db.user.findUnique({
            where: { wallet_address: walletAddress },
            select: {
                username: true,
                display_name: true,
            }
        });

        if (user?.username) {
            return {
                displayName: user.username,
                username: user.username,
                isUsername: true
            };
        }

        if (user?.display_name) {
            return {
                displayName: user.display_name,
                isUsername: false
            };
        }

        return {
            displayName: `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}`,
            isUsername: false
        };
    } catch (error) {
        console.error('Error fetching user display info:', error);
        // Fallback to wallet address
        return {
            displayName: `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}`,
            isUsername: false
        };
    }
}

export function formatWalletAddress(address: string): string {
    if (address.length <= 6) return address;
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
}
