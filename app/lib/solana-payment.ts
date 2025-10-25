import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    ComputeBudgetProgram,
} from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

// Solana network configuration
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PLATFORM_WALLET_PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;

export interface PaymentRequest {
    buyerKeypair: Keypair;
    creatorPublicKey: PublicKey;
    totalAmount: number; // in lamports
    feePercent: number; // e.g., 5 for 5%
    videoId: string;
}

export interface PaymentResult {
    success: boolean;
    transactionSignature?: string;
    error?: string;
    platformFee: number;
    creatorPayout: number;
}

/**
 * Calculate platform fee and creator payout
 */
export function calculatePaymentBreakdown(totalAmount: number, feePercent: number) {
    const platformFee = Math.floor((totalAmount * feePercent) / 100);
    const creatorPayout = totalAmount - platformFee;

    return {
        platformFee,
        creatorPayout,
        totalAmount
    };
}

/**
 * Create a Solana transaction for video payment
 */
export async function createPaymentTransaction(
    connection: Connection,
    paymentRequest: PaymentRequest
): Promise<PaymentResult> {
    try {
        const { buyerKeypair, creatorPublicKey, totalAmount, feePercent, videoId } = paymentRequest;

        // Calculate payment breakdown
        const { platformFee, creatorPayout } = calculatePaymentBreakdown(totalAmount, feePercent);

        // Get platform wallet keypair
        if (!PLATFORM_WALLET_PRIVATE_KEY) {
            throw new Error('Platform wallet private key not configured');
        }

        const platformKeypair = Keypair.fromSecretKey(
            bs58.decode(PLATFORM_WALLET_PRIVATE_KEY)
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash();

        // Create transaction
        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = buyerKeypair.publicKey;

        // Add compute budget instructions for optimization
        transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 })
        );
        transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 })
        );

        // Add platform fee transfer
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: buyerKeypair.publicKey,
                toPubkey: platformKeypair.publicKey,
                lamports: platformFee,
            })
        );

        // Add creator payout transfer
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: buyerKeypair.publicKey,
                toPubkey: creatorPublicKey,
                lamports: creatorPayout,
            })
        );

        // Add memo instruction with video ID
        transaction.add(
            new TransactionInstruction({
                keys: [],
                programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysKcWfC85B2q2'),
                data: Buffer.from(`Video Payment: ${videoId}`, 'utf8'),
            })
        );

        // Sign and send transaction
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [buyerKeypair],
            { commitment: 'confirmed' }
        );

        return {
            success: true,
            transactionSignature: signature,
            platformFee,
            creatorPayout,
        };

    } catch (error) {
        console.error('Payment transaction failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            platformFee: 0,
            creatorPayout: 0,
        };
    }
}

/**
 * Verify transaction signature
 */
export async function verifyTransaction(
    connection: Connection,
    signature: string
): Promise<boolean> {
    try {
        const transaction = await connection.getTransaction(signature);
        return transaction !== null;
    } catch (error) {
        console.error('Transaction verification failed:', error);
        return false;
    }
}

/**
 * Get account balance
 */
export async function getAccountBalance(
    connection: Connection,
    publicKey: PublicKey
): Promise<number> {
    try {
        const balance = await connection.getBalance(publicKey);
        return balance;
    } catch (error) {
        console.error('Failed to get account balance:', error);
        return 0;
    }
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
}

/**
 * Create connection to Solana network
 */
export function createSolanaConnection(): Connection {
    return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Generate a new keypair (for testing)
 */
export function generateKeypair(): Keypair {
    return Keypair.generate();
}

/**
 * Create keypair from private key
 */
export function createKeypairFromPrivateKey(privateKey: string): Keypair {
    return Keypair.fromSecretKey(bs58.decode(privateKey));
}
