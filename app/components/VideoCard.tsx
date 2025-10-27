'use client';

import { useWallet } from '@/app/contexts/WalletContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Play, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PaymentDialog } from './PaymentDialog';

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
    createdAt?: string;
}

export const VideoCard = ({
    id,
    youtubeUrl,
    title,
    thumbnailUrl,
    solPrice,
    isPaid,
    isLive,
    walletAddress,
    hasPurchased = false,
    createdAt
}: VideoCardProps) => {
    const { walletAddress: currentUserWallet } = useWallet();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<{
        displayName: string;
        username?: string;
        isUsername: boolean;
        avatarUrl?: string;
    } | null>(null);
    const [hasPurchasedState, setHasPurchasedState] = useState(false);
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

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
                    isUsername: !!user.username,
                    avatarUrl: user.avatar_url
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const canWatch = !isPaid || hasPurchasedState || walletAddress === currentUserWallet;

    // Check purchase status on mount and when relevant state changes
    const checkPurchaseStatus = async () => {
        if (!currentUserWallet || isCheckingPurchase) return;

        console.log('Checking purchase status for video:', id, 'buyer:', currentUserWallet);
        setIsCheckingPurchase(true);
        try {
            const response = await fetch(`/api/payments?videoId=${id}&buyerWallet=${currentUserWallet}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Purchase check result:', data);
                setHasPurchasedState(data.hasPurchased);
            } else {
                console.error('Failed to check purchase status:', response.status);
                setHasPurchasedState(false); // Default to not purchased on error
            }
        } catch (error) {
            console.error('Error checking purchase status:', error);
            setHasPurchasedState(false); // Default to not purchased on error
        } finally {
            setIsCheckingPurchase(false);
        }
    };

    // Initial purchase status check
    useEffect(() => {
        // Reset state if user disconnects
        if (!currentUserWallet) {
            setHasPurchasedState(false);
            return;
        }

        // Check purchase status if this is a paid video
        if (isPaid) {
            checkPurchaseStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPaid, currentUserWallet, id]);

    // Separate useEffect to handle wallet changes and video changes
    useEffect(() => {
        if (isPaid && currentUserWallet) {
            checkPurchaseStatus();
        } else if (!currentUserWallet) {
            setHasPurchasedState(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserWallet, id]);

    const handlePaymentSuccess = () => {
        setHasPurchasedState(true);
        toast.success('Payment successful! You can now watch the video.');
    };

    const handleCardClick = () => {
        router.push(`/video/${id}`);
    };

    const handleCreatorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (userInfo?.isUsername && userInfo.username) {
            router.push(`/user/${userInfo.username}`);
        } else if (walletAddress) {
            router.push(`/user/${walletAddress}`);
        }
    };

    // Show buy button only if: paid content AND user hasn't purchased AND not creator's own video
    const showBuyButton = isPaid && !hasPurchasedState && walletAddress !== currentUserWallet;

    return (
        <div 
            className="group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            {/* Thumbnail Container */}
            <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden mb-3">
                {/* Thumbnail/Video Preview */}
                <div className="relative w-full h-full">
                    {canWatch ? (
                        <iframe
                            className="w-full h-full pointer-events-none"
                            src={youtubeUrl.replace("watch", "embed").replace("?v=", "/")}
                            title="YouTube video player"
                            frameBorder="0"
                        />
                    ) : (
                        <>
                            <iframe
                                className="w-full h-full pointer-events-none"
                                src={youtubeUrl.replace("watch", "embed").replace("?v=", "/")}
                                title="YouTube video player"
                                frameBorder="0"
                            />
                            {/* Paid Overlay - Blur effect */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-neutral-800/80 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <Wallet className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="text-white font-semibold text-sm mb-1">Paid Content</p>
                                    <p className="text-green-400 text-lg font-bold">{solPrice} SOL</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* LIVE Badge */}
                    {isLive && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 rounded text-xs font-bold flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                        </div>
                    )}

                    {/* Paid Badge */}
                    {isPaid && !isLive && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-600/90 backdrop-blur-sm rounded text-xs font-bold">
                            {solPrice} SOL
                        </div>
                    )}

                    {/* Purchased Badge */}
                    {isPaid && hasPurchasedState && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-green-600/90 backdrop-blur-sm rounded text-xs font-bold">
                            ✓ Purchased
                        </div>
                    )}

                    {/* Your Video Badge (for creator's own videos) */}
                    {isPaid && walletAddress === currentUserWallet && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600/90 backdrop-blur-sm rounded text-xs font-bold">
                            Your Video
                        </div>
                    )}

                    {/* Hover Overlay */}
                    {isHovered && canWatch && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity">
                            <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                                <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Info */}
            <div className="flex gap-3">
                {/* Creator Avatar */}
                <div 
                    className="w-9 h-9 rounded-full bg-neutral-800 border border-green-500/50 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-green-500 transition"
                    onClick={handleCreatorClick}
                >
                    {userInfo?.avatarUrl ? (
                        <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {userInfo?.displayName?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>

                {/* Video Details */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-neutral-200 transition">
                        {title}
                    </h3>

                    {/* Creator Name */}
                    <p 
                        className="text-xs text-neutral-400 hover:text-neutral-300 cursor-pointer mb-1"
                        onClick={handleCreatorClick}
                    >
                        {userInfo?.displayName || 'Unknown Creator'}
                    </p>

                    {/* Date */}
                    {createdAt && (
                        <p className="text-xs text-neutral-400">
                            {formatDate(createdAt)}
                        </p>
                    )}

                    {/* Buy Button - Only show for unpurchased paid content */}
                    {showBuyButton && (
                        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <PaymentDialog
                                videoId={id}
                                videoTitle={title}
                                solPrice={solPrice}
                                creatorWalletAddress={walletAddress || ''}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
