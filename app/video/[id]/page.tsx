'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { CreateVideoButton } from '@/app/components/CreateVideoButton';
import { ArrowLeft, Home, ThumbsUp, Share2, MoreHorizontal, Play, Wallet } from 'lucide-react';
import { useWallet } from '@/app/contexts/WalletContext';
import { toast } from 'sonner';

interface Video {
    id: string;
    youtube_url: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    sol_price: number | null;
    is_paid: boolean | null;
    is_live: boolean | null;
    wallet_address: string;
    created_at: string;
}

interface UserProfile {
    id: string;
    wallet_address: string;
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    joined_date: string;
}

const VideoPlayerPage = () => {
    const params = useParams();
    const router = useRouter();
    const { walletAddress } = useWallet();
    const [video, setVideo] = useState<Video | null>(null);
    const [suggestedVideos, setSuggestedVideos] = useState<Video[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    const videoId = params.id as string;

    useEffect(() => {
        if (videoId) {
            fetchVideoData();
        }
    }, [videoId, walletAddress]); // Add walletAddress to dependencies

    const fetchVideoData = async () => {
        try {
            setLoading(true);

            // Fetch all videos to get the specific video and suggestions
            const response = await fetch('/api/videos');
            if (!response.ok) throw new Error('Failed to fetch videos');

            const allVideos = await response.json();
            const currentVideo = allVideos.find((v: Video) => v.id === videoId);

            if (!currentVideo) {
                toast.error('Video not found');
                router.push('/');
                return;
            }

            setVideo(currentVideo);

            // Get suggested videos (exclude current video)
            const suggestions = allVideos
                .filter((v: Video) => v.id !== videoId)
                .slice(0, 10); // Show 10 suggestions
            setSuggestedVideos(suggestions);

            // Fetch user profile
            await fetchUserProfile(currentVideo.wallet_address);

            // Check if user has purchased this video BEFORE setting loading to false
            if (walletAddress && currentVideo.is_paid) {
                await checkPurchaseStatus();
            }

        } catch (error) {
            console.error('Error fetching video data:', error);
            toast.error('Failed to load video');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async (walletAddress: string) => {
        try {
            const response = await fetch(`/api/user/profile?wallet_address=${walletAddress}`);
            if (response.ok) {
                const profile = await response.json();
                setUserProfile(profile);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const checkPurchaseStatus = async () => {
        if (!walletAddress || isCheckingPurchase) return;

        console.log('Checking purchase status for video:', videoId, 'buyer:', walletAddress);
        setIsCheckingPurchase(true);
        try {
            const response = await fetch(`/api/payments?videoId=${videoId}&buyerWallet=${walletAddress}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Purchase check result:', data);
                setHasPurchased(data.hasPurchased);
            } else {
                console.error('Failed to check purchase status:', response.status);
                setHasPurchased(false);
            }
        } catch (error) {
            console.error('Error checking purchase status:', error);
            setHasPurchased(false);
        } finally {
            setIsCheckingPurchase(false);
        }
    };

    // Separate useEffect to handle wallet changes after initial load
    useEffect(() => {
        if (video && video.is_paid && walletAddress) {
            checkPurchaseStatus();
        } else if (!walletAddress) {
            // Reset purchase status if wallet disconnects
            setHasPurchased(false);
        }
    }, [walletAddress, video?.id]); // Check when wallet or video changes

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

    const getEmbedUrl = (youtubeUrl: string) => {
        return youtubeUrl.replace("watch", "embed").replace("?v=", "/");
    };

    const canWatch = !video?.is_paid || hasPurchased || walletAddress === video?.wallet_address;

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white">
                <header className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-800">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <Image src="/Galaxie1.png" alt="Galaxie Logo" width={36} height={36} className="rounded-lg" />
                                <span className="font-bold text-lg hidden sm:block">Galaxie</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                                <Home className="w-5 h-5" />
                            </Button>
                            {walletAddress && <CreateVideoButton />}
                            <PhantomWalletButton />
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-400">Loading video...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white">
                <header className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-800">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <Image src="/Galaxie1.png" alt="Galaxie Logo" width={36} height={36} className="rounded-lg" />
                                <span className="font-bold text-lg hidden sm:block">Galaxie</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                                <Home className="w-5 h-5" />
                            </Button>
                            {walletAddress && <CreateVideoButton />}
                            <PhantomWalletButton />
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-neutral-400">Video not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-800">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="hover:bg-neutral-800">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <Image src="/Galaxie1.png" alt="Galaxie Logo" width={36} height={36} className="rounded-lg" />
                            <span className="font-bold text-lg hidden sm:block">Galaxie</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="hover:bg-neutral-800">
                            <Home className="w-5 h-5" />
                        </Button>
                        {walletAddress && <CreateVideoButton />}
                        <PhantomWalletButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1800px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-6 p-4">
                    {/* Left Column - Video Player & Info */}
                    <div className="flex-1 lg:max-w-[calc(100%-400px)]">
                        {/* Video Player */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                            {canWatch ? (
                                <iframe
                                    className="w-full h-full"
                                    src={getEmbedUrl(video.youtube_url)}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800">
                                    <div className="text-center">
                                        <Play className="w-20 h-20 text-white/30 mb-4 mx-auto" />
                                        <p className="text-neutral-400 text-lg mb-2">This is a paid video</p>
                                        <p className="text-sm text-neutral-500 mb-4">Purchase to watch</p>
                                        {video.sol_price && (
                                            <div className="flex items-center justify-center gap-2 text-green-500">
                                                <Wallet className="w-5 h-5" />
                                                <span className="text-xl font-bold">{video.sol_price} SOL</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {video.is_live && (
                                <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 rounded text-xs font-bold">
                                    LIVE
                                </div>
                            )}
                        </div>

                        {/* Video Title */}
                        <h1 className="text-xl font-bold mb-3 leading-tight">
                            {video.title}
                        </h1>

                        {/* Video Meta & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-green-500 flex items-center justify-center overflow-hidden">
                                    {userProfile?.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Image src="/Galaxie1.png" alt="Default Avatar" width={24} height={24} className="rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        {userProfile?.display_name || userProfile?.username || 'Unknown User'}
                                    </h3>
                                    <p className="text-sm text-neutral-400">
                                        {userProfile?.wallet_address ? `${userProfile.wallet_address.slice(0, 4)}...${userProfile.wallet_address.slice(-4)}` : ''}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition">
                                    <ThumbsUp className="w-5 h-5" />
                                    <span className="font-medium text-sm">Like</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full transition">
                                    <Share2 className="w-5 h-5" />
                                    <span className="font-medium text-sm">Share</span>
                                </button>
                                {video.is_paid && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700 rounded-full">
                                        <Wallet className="w-4 h-4 text-green-500" />
                                        <span className="font-medium text-sm text-green-400">
                                            {(video.sol_price || 0)} SOL
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video Description */}
                        {video.description && (
                            <div className="bg-neutral-900 rounded-xl p-4 hover:bg-neutral-800/50 transition">
                                <div className="flex items-center gap-3 mb-2 text-sm font-medium text-neutral-400">
                                    <span>{formatDate(video.created_at)}</span>
                                </div>
                                <p className={`text-sm leading-relaxed ${showFullDescription ? '' : 'line-clamp-3'}`}>
                                    {video.description}
                                </p>
                                {video.description.length > 150 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="text-sm font-medium mt-2 hover:text-neutral-300"
                                    >
                                        {showFullDescription ? 'Show less' : 'Show more'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Suggested Videos */}
                    <div className="lg:w-[400px] xl:w-[420px]">
                        <div className="space-y-2">
                            {suggestedVideos.length === 0 ? (
                                <p className="text-neutral-400 text-center py-8">No suggestions available</p>
                            ) : (
                                suggestedVideos.map((suggestedVideo) => (
                                    <div
                                        key={suggestedVideo.id}
                                        className="flex gap-2 p-2 rounded-xl hover:bg-neutral-900 transition cursor-pointer group"
                                        onClick={() => router.push(`/video/${suggestedVideo.id}`)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-40 h-24 flex-shrink-0 bg-neutral-800 rounded-lg overflow-hidden">
                                            <iframe
                                                className="w-full h-full pointer-events-none"
                                                src={getEmbedUrl(suggestedVideo.youtube_url)}
                                                title="Video thumbnail"
                                                frameBorder="0"
                                            />
                                            {suggestedVideo.is_live && (
                                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-600 rounded text-xs font-bold">
                                                    LIVE
                                                </div>
                                            )}
                                            {suggestedVideo.is_paid && (
                                                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-600 rounded text-xs font-bold">
                                                    PAID
                                                </div>
                                            )}
                                        </div>

                                        {/* Video Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-neutral-200">
                                                {suggestedVideo.title}
                                            </h3>
                                            <p className="text-xs text-neutral-400 mb-0.5">
                                                {userProfile?.display_name || userProfile?.username || 'Unknown'}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-neutral-400">
                                                <span>{formatDate(suggestedVideo.created_at)}</span>
                                            </div>
                                            {suggestedVideo.is_paid && suggestedVideo.sol_price && (
                                                <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                                                    <Wallet className="w-3 h-3" />
                                                    <span>{suggestedVideo.sol_price} SOL</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerPage;
