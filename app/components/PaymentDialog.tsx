'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { useWallet } from '@/app/contexts/WalletContext';
import { requestWalletSignature, getWalletAddress } from '@/app/lib/wallet-utils';

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
            // Request wallet signature for authentication
            const message = `Payment for video: ${videoTitle}`;
            const signatureResult = await requestWalletSignature(message);

            if (!signatureResult) {
                throw new Error('Failed to get wallet signature');
            }

            // For demo purposes, we'll use a simplified approach
            // In production, you'd implement proper key derivation or use a different auth method
            const demoPrivateKey = 'demo-key-for-testing'; // This should be replaced with proper auth

            // Make payment request
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wallet-Address': walletAddress,
                    'X-Wallet-Signature': Array.from(signatureResult.signature).join(','),
                    'X-Wallet-Message': message,
                },
                body: JSON.stringify({
                    buyerPrivateKey: demoPrivateKey, // Simplified for demo
                    creatorWalletAddress,
                    amount: solPrice,
                    feePercent: 5, // 5% platform fee
                    videoId,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Payment failed');
            }

            setSuccess(true);
            setTransactionSignature(result.transactionSignature);

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

    const handleClose = () => {
        setIsOpen(false);
        setError(null);
        setSuccess(false);
        setTransactionSignature(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                    disabled={!isConnected}
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Buy for {solPrice} SOL
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Purchase Video</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{videoTitle}</CardTitle>
                            <CardDescription>Video ID: {videoId}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Price:</span>
                                    <span className="font-semibold">{solPrice} SOL</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Platform Fee (5%):</span>
                                    <span>{(solPrice * 0.05).toFixed(4)} SOL</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Creator Receives:</span>
                                    <span>{(solPrice * 0.95).toFixed(4)} SOL</span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-semibold">
                                    <span>Total:</span>
                                    <span>{solPrice} SOL</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isConnected && (
                        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">Please connect your wallet to proceed</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">Payment successful!</span>
                            </div>
                            {transactionSignature && (
                                <div className="text-xs text-gray-500 break-all">
                                    Transaction: {transactionSignature}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex space-x-2">
                        <Button
                            onClick={handlePayment}
                            disabled={!isConnected || isProcessing}
                            className="flex-1"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Confirm Payment
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
