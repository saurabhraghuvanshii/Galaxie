/**
 * Wallet utility functions for Solana integration
 */

export interface WalletSignature {
    signature: Uint8Array;
    publicKey: string;
}

/**
 * Request wallet signature for authentication
 */
export async function requestWalletSignature(message: string): Promise<WalletSignature | null> {
    try {
        if (!(window as any).solana || !(window as any).solana.isPhantom) {
            throw new Error('Phantom wallet not found');
        }

        const encodedMessage = new TextEncoder().encode(message);
        const response = await (window as any).solana.signMessage(encodedMessage);

        if (!response) {
            throw new Error('User rejected signature request');
        }

        return {
            signature: response.signature,
            publicKey: response.publicKey.toString(),
        };
    } catch (error) {
        console.error('Wallet signature error:', error);
        return null;
    }
}

/**
 * Get connected wallet address
 */
export async function getWalletAddress(): Promise<string | null> {
    try {
        if (!(window as any).solana || !(window as any).solana.isPhantom) {
            return null;
        }

        const response = await (window as any).solana.connect();
        return response.publicKey.toString();
    } catch (error) {
        console.error('Error getting wallet address:', error);
        return null;
    }
}

/**
 * Check if Phantom wallet is installed
 */
export function isPhantomInstalled(): boolean {
    return !!(window as any).solana && (window as any).solana.isPhantom;
}

/**
 * Connect to Phantom wallet
 */
export async function connectWallet(): Promise<string | null> {
    try {
        if (!isPhantomInstalled()) {
            throw new Error('Phantom wallet not installed');
        }

        const response = await (window as any).solana.connect();
        return response.publicKey.toString();
    } catch (error) {
        console.error('Wallet connection error:', error);
        return null;
    }
}

/**
 * Disconnect from Phantom wallet
 */
export async function disconnectWallet(): Promise<void> {
    try {
        if ((window as any).solana && (window as any).solana.disconnect) {
            await (window as any).solana.disconnect();
        }
    } catch (error) {
        console.error('Wallet disconnection error:', error);
    }
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string, startChars = 4, endChars = 4): string {
    if (address.length <= startChars + endChars) {
        return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Validate Solana wallet address
 */
export function isValidWalletAddress(address: string): boolean {
    try {
        // Basic validation for Solana address format
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    } catch {
        return false;
    }
}

