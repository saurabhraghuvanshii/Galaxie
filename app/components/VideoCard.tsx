'use client';

import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useWallet } from '@/app/contexts/WalletContext';
import { useState } from 'react';
import { toast } from 'sonner';

interface VideoCardProps {
    id: string;
    youtubeUrl: string;
    title: string;
    thumbnailUrl?: string;
    solPrice: number;
    isPaid: boolean;
    isLive: boolean;
    walletAddress?: string; // Wallet address of the video owner
    hasPurchased?: boolean; // Whether current user has purchased this video
}

export const VideoCard = ({
    youtubeUrl,
    title,
    thumbnailUrl,
    solPrice,
    isPaid,
    isLive,
    walletAddress,
    hasPurchased = false
}: VideoCardProps) => {
    const { walletAddress: currentUserWallet } = useWallet();
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Extract YouTube video ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYoutubeId(youtubeUrl);
    const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    // Format wallet address for display
    const formatWalletAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // Check if user can watch the video
    const canWatch = !isPaid || hasPurchased || walletAddress === currentUserWallet;

    // Handle video purchase
    const handlePurchase = async () => {
        if (!currentUserWallet) {
            toast.error('Please connect your wallet to purchase');
            return;
        }

        setIsPurchasing(true);
        try {
            // TODO: Implement SOL payment logic here
            toast.success('Purchase functionality coming soon!');
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error('Failed to purchase video');
        } finally {
            setIsPurchasing(false);
        }
    };

    // Handle video play
    const handlePlay = () => {
        if (canWatch) {
            window.open(youtubeUrl, '_blank');
        } else {
            toast.error('Please purchase this video to watch');
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={handlePlay}
                />
                {isLive && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        LIVE
                    </Badge>
                )}
                {!canWatch && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                            Paid Content
                        </Badge>
                    </div>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h3>

                {/* Wallet Address */}
                {walletAddress && (
                    <div className="flex items-center gap-1 mb-2">
                        <span className="text-xs text-muted-foreground">By:</span>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {formatWalletAddress(walletAddress)}
                        </span>
                    </div>
                )}

                {/* Price and Action Button */}
                <div className="flex items-center justify-between gap-2">
                    {isPaid ? (
                        <>
                            <span className="text-green-600 font-bold font-roboto">
                                {solPrice} SOL
                            </span>
                            {canWatch ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {hasPurchased ? 'Purchased' : 'Your Video'}
                                </Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handlePurchase}
                                    disabled={isPurchasing}
                                    className="border border-green-500 hover:border-green-600 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-roboto font-bold px-3 py-1 rounded text-xs"
                                >
                                    {isPurchasing ? 'Buying...' : `Buy ${solPrice} SOL`}
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                FREE
                            </Badge>
                            <Button
                                size="sm"
                                onClick={handlePlay}
                                className="border border-blue-500 hover:border-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-roboto font-bold px-3 py-1 rounded text-xs"
                            >
                                Watch
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
