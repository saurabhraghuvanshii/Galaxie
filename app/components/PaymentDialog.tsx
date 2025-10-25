'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useWallet } from '@/app/contexts/WalletContext';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || '';

interface PaymentDialogProps {
    videoId: string;
    videoTitle: string;
    solPrice: number;
    creatorWalletAddress: string;
    onPaymentSuccess?: () => void;
}

export function PaymentDialog({
    videoId,
    videoTitle,
    solPrice,
    creatorWalletAddress,
    onPaymentSuccess
}: PaymentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
    const { walletAddress, isConnecting } = useWallet();
    const isConnected = !!walletAddress;

    const handlePayment = async () => {
        if (!isConnected || !walletAddress) {
            setError('Please connect your wallet first');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Check if Phantom wallet is available
            const phantom = (window as any).solana;
            if (!phantom || !phantom.isPhantom) {
                throw new Error('Phantom wallet not found. Please install Phantom wallet.');
            }

            // Calculate platform fee based on price threshold
            const feePercent = solPrice >= 0.01 ? 5 : 0; // 5% if >= 0.01 SOL, 0% if < 0.01 SOL
            const platformFee = solPrice >= 0.01 ? solPrice * 0.05 : 0;
            const creatorPayout = solPrice - platformFee;

            // Create Solana connection
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

            // Get recent blockhash
            const { blockhash } = await connection.getLatestBlockhash();

            // Create transaction
            const transaction = new Transaction({
                recentBlockhash: blockhash,
                feePayer: new PublicKey(walletAddress),
            });

            // Platform wallet address
            const platformWallet = new PublicKey(PLATFORM_WALLET_ADDRESS);
            const creatorWallet = new PublicKey(creatorWalletAddress);

            // Add transfer to platform (if there's a platform fee)
            if (platformFee > 0) {
                transaction.add(
                    SystemProgram.transfer({
                        fromPubkey: new PublicKey(walletAddress),
                        toPubkey: platformWallet,
                        lamports: Math.floor(platformFee * LAMPORTS_PER_SOL),
                    })
                );
            }

            // Add transfer to creator
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(walletAddress),
                    toPubkey: creatorWallet,
                    lamports: Math.floor(creatorPayout * LAMPORTS_PER_SOL),
                })
            );

            // Request Phantom to sign and send transaction
            const { signature } = await phantom.signAndSendTransaction(transaction);

            if (!signature) {
                throw new Error('Transaction was not signed');
            }

            // Wait for transaction confirmation
            await connection.confirmTransaction(signature, 'confirmed');

            // Save purchase to database
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    buyerWalletAddress: walletAddress,
                    creatorWalletAddress,
                    amount: solPrice,
                    feePercent: feePercent,
                    videoId,
                    transactionSignature: signature,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to save purchase record');
            }

            setSuccess(true);
            setTransactionSignature(signature);

            if (onPaymentSuccess) {
                onPaymentSuccess();
            }

        } catch (error) {
            console.error('Payment error:', error);
            setError(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setIsOpen(false);
            setError(null);
            setSuccess(false);
            setTransactionSignature(null);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Buy for {solPrice} SOL
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Purchase Video</DialogTitle>
                    <DialogDescription>
                        Complete your purchase to access this premium content
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Video Info */}
                    <Card className="border-2 border-green-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg line-clamp-2">{videoTitle}</CardTitle>
                            <CardDescription className="text-sm">Video ID: {videoId}</CardDescription>
                        </CardHeader>
                    </Card>

                    {/* Payment Details */}
                    <Card className="border-2 border-green-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Payment Details</CardTitle>
                            <CardDescription className="text-sm">Transaction information and wallet addresses</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Buyer Info */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-200">Your Wallet Address</Label>
                                <div className="p-2 border-green-900 bg-gray-900 rounded border text-sm font-mono">
                                    {walletAddress || 'Not connected'}
                                </div>
                            </div>

                            {/* Creator Info */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-200">Creator Wallet Address</Label>
                                <div className="p-2 border-green-900 bg-gray-900 rounded border text-sm font-mono break-all">
                                    {creatorWalletAddress}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-200">Video Price:</span>
                                    <span className="font-semibold text-lg">{solPrice} SOL</span>
                                </div>
                                {solPrice >= 0.01 ? (
                                    <>
                                        <div className="flex justify-between text-sm text-gray-200">
                                            <span>Platform Fee (5%):</span>
                                            <span>{(solPrice * 0.05).toFixed(4)} SOL</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-200">
                                            <span>Creator Receives:</span>
                                            <span>{(solPrice * 0.95).toFixed(4)} SOL</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm text-gray-200">
                                            <span>Platform Fee:</span>
                                            <span>0.0000 SOL</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-200">
                                            <span>Creator Receives:</span>
                                            <span>{solPrice} SOL</span>
                                        </div>
                                    </>
                                )}
                                <hr className="border-gray-300" />
                                <div className="flex justify-between items-center text-lg font-bold text-green-700">
                                    <span>Total Payment:</span>
                                    <span>{solPrice} SOL</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Messages */}
                    {!isConnected && (
                        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <AlertCircle className="w-5 h-5" />
                            <div>
                                <p className="font-medium">Wallet Not Connected</p>
                                <p className="text-sm">Please connect your Phantom wallet to proceed with the purchase.</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                            <AlertCircle className="w-5 h-5" />
                            <div>
                                <p className="font-medium">Payment Failed</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
                                <AlertCircle className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">Payment Successful!</p>
                                    <p className="text-sm">You can now watch this video.</p>
                                </div>
                            </div>
                            {transactionSignature && (
                                <div className="p-3 bg-gray-100 rounded border">
                                    <p className="text-xs text-gray-600 mb-1">Transaction Signature:</p>
                                    <p className="text-xs font-mono break-all text-gray-800">{transactionSignature}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                        <Button
                            onClick={handlePayment}
                            disabled={!isConnected || isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                            size="lg"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Confirm Payment
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setError(null);
                                setSuccess(false);
                                setTransactionSignature(null);
                            }}
                            className="px-6"
                            size="lg"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
