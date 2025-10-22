'use client';

import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useWallet } from '@/app/contexts/WalletContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface VideoCardProps {
    id: string;
    youtubeUrl: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    solPrice: number;
    isPaid: boolean;
    isLive: boolean;
    walletAddress?: string;
    hasPurchased?: boolean;
}

export const VideoCard = ({
    youtubeUrl,
    title,
    description,
    thumbnailUrl,
    solPrice,
    isPaid,
    isLive,
    walletAddress,
    hasPurchased = false
}: VideoCardProps) => {
    const { walletAddress: currentUserWallet } = useWallet();
    const router = useRouter();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [userInfo, setUserInfo] = useState<{
        displayName: string;
        username?: string;
        isUsername: boolean;
    } | null>(null);

    // Fetch user info
    useEffect(() => {
        if (walletAddress) {
            fetchUserInfo();
        }
    }, [walletAddress]);

    const fetchUserInfo = async () => {
        if (!walletAddress) return;

        try {
            const response = await fetch(`/api/user/profile?wallet_address=${walletAddress}`);
            if (response.ok) {
                const user = await response.json();
                setUserInfo({
                    displayName: user.username || user.display_name || `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}`,
                    username: user.username,
                    isUsername: !!user.username
                });
            } else {
                // Fallback to wallet address
                setUserInfo({
                    displayName: `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}`,
                    isUsername: false
                });
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            setUserInfo({
                displayName: `${walletAddress.slice(0, 3)}...${walletAddress.slice(-3)}`,
                isUsername: false
            });
        }
    };

    // Extract YouTube video ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYoutubeId(youtubeUrl);
    const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    const formatWalletAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

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

    // Handle video play (for paid content overlay)
    const handlePlay = () => {
        if (!canWatch) {
            toast.error('Please purchase this video to watch');
        }
    };

    return (
        <Card className="overflow-hidden border border-green-900 hover:border-green-700 hover:shadow-lg transition-shadow">
            <div className="relative aspect-video">
                {canWatch ? (
                    <iframe
                        className="w-full h-full rounded-lg"
                        src={youtubeUrl.replace("watch", "embed").replace("?v=", "/")}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    />
                ) : (
                    <>
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={youtubeUrl.replace("watch", "embed").replace("?v=", "/")}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        />
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-xs rounded-lg flex items-center justify-center cursor-pointer" onClick={handlePlay}>
                            <Badge variant="secondary" className="text-lg px-4 py-2  text-white border-green-800">
                                Paid
                            </Badge>
                        </div>
                    </>
                )}
                {isLive && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        LIVE
                    </Badge>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h3>

                {/* Description */}
                {description && (
                    <div className="mb-3">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <p className={`text-xs text-gray-100 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                                        {description}
                                    </p>
                                </div>
                                {description.length > 100 && (
                                    <button
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="shrink-0 p-1 hover:bg-gray-700 rounded transition-colors"
                                    >
                                        {isDescriptionExpanded ? (
                                            <ChevronUp className="w-3 h-3 text-gray-200" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3 text-gray-200" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* User Info */}
                {userInfo && (
                    <div className="mb-2">
                        <button
                            onClick={() => {
                                if (userInfo.isUsername && userInfo.username) {
                                    router.push(`/user/${userInfo.username}`);
                                } else {
                                    router.push(`/user/${walletAddress}`);
                                }
                            }}
                            className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-200 cursor-pointer transition-colors"
                        >
                            By: {userInfo.displayName}
                        </button>
                    </div>
                )}

                {/* Price and Action Button */}
                <div className="flex items-center justify-between gap-2">
                    {isPaid ? (
                        <>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                Paid
                            </Badge>
                            {canWatch ? (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {hasPurchased ? 'Purchased' : 'Your Video'}
                                </Badge>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handlePurchase}
                                    disabled={isPurchasing}
                                    className="border border-green-500 hover:border-green-600 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-roboto font-bold px-3 py-1 rounded text-xs cursor-pointer"
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
                                onClick={() => window.open(youtubeUrl, '_blank')}
                                className="border border-blue-500 hover:border-blue-600 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-roboto font-bold px-3 py-1 rounded text-xs cursor-pointer"
                            >
                                Open in YouTube
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
