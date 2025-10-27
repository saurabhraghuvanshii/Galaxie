'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/app/contexts/WalletContext';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Loader2, ShoppingBag, Calendar, Wallet, Play, Home, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { CreateVideoButton } from '@/app/components/CreateVideoButton';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Purchase {
    id: string;
    video_id: string;
    buyer_wallet_address: string;
    creator_wallet_address: string;
    amount_paid: string;
    platform_fee: string;
    creator_payout: string;
    transaction_signature: string;
    status: string;
    block_number?: number;
    created_at: string;
    completed_at?: string;
    video: {
        id: string;
        title: string;
        description?: string;
        youtube_url: string;
        thumbnail_url?: string;
        sol_price: number;
        is_paid: boolean;
        wallet_address: string;
        created_at: string;
    };
}

export default function PurchasedVideosPage() {
    const { walletAddress } = useWallet();
    const router = useRouter();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (walletAddress) {
            fetchPurchasedVideos();
        } else {
            setLoading(false);
        }
    }, [walletAddress]);

    const fetchPurchasedVideos = async () => {
        if (!walletAddress) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/purchased?wallet_address=${walletAddress}`);

            if (!response.ok) {
                throw new Error('Failed to fetch purchased videos');
            }

            const data = await response.json();
            setPurchases(data);
        } catch (err) {
            console.error('Error fetching purchased videos:', err);
            setError('Failed to load purchased videos');
        } finally {
            setLoading(false);
        }
    };

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

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const formatSolAmount = (lamports: string) => {
        const amount = parseFloat(lamports) / 1e9;
        return amount;
    };

    const getEmbedUrl = (youtubeUrl: string) => {
        return youtubeUrl.replace("watch", "embed").replace("?v=", "/");
    };

    if (!walletAddress) {
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
                        <PhantomWalletButton />
                    </div>
                </header>
                <div className="max-w-[1800px] mx-auto px-4 py-20">
                    <div className="flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-10 h-10 text-neutral-600" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Connect Your Wallet</h3>
                            <p className="text-neutral-400 mb-6">
                                Please connect your wallet to view your purchased videos
                            </p>
                            <PhantomWalletButton />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            {walletAddress && <CreateVideoButton />}
                            <PhantomWalletButton />
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-neutral-400">Loading your purchased videos...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
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
                            {walletAddress && <CreateVideoButton />}
                            <PhantomWalletButton />
                        </div>
                    </div>
                </header>
                <div className="max-w-[1800px] mx-auto px-4 py-20">
                    <div className="flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-4xl">⚠️</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Error Loading Videos</h3>
                            <p className="text-neutral-400 mb-6">{error}</p>
                            <Button onClick={fetchPurchasedVideos} className="bg-green-600 hover:bg-green-700">
                                Try Again
                            </Button>
                        </div>
                    </div>
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
            <div className="max-w-[1800px] mx-auto px-4 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Purchased Videos</h1>
                    </div>
                    <p className="text-neutral-400 ml-13">
                        {purchases.length > 0 
                            ? `${purchases.length} video${purchases.length === 1 ? '' : 's'} in your library`
                            : 'Your collection of purchased videos'
                        }
                    </p>
                </div>

                {/* Content */}
                {purchases.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center max-w-lg">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-900 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">No Purchased Videos Yet</h3>
                            <p className="text-neutral-400 mb-6">
                                Start exploring and purchasing videos to build your collection!
                            </p>
                            <Button 
                                onClick={() => router.push('/')} 
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Browse Videos
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {purchases.map((purchase) => (
                            <div
                                key={purchase.id}
                                className="group cursor-pointer"
                                onClick={() => router.push(`/video/${purchase.video_id}`)}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-neutral-900 rounded-xl overflow-hidden mb-3">
                                    <iframe
                                        className="w-full h-full pointer-events-none"
                                        src={getEmbedUrl(purchase.video.youtube_url)}
                                        title="YouTube video player"
                                        frameBorder="0"
                                    />
                                    
                                    {/* Purchased Badge */}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-600/90 backdrop-blur-sm rounded text-xs font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Purchased
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                        <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-6 h-6 text-white ml-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Video Info */}
                                <div className="flex gap-3">
                                    {/* Creator Avatar Placeholder */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                                        {purchase.video.title[0]?.toUpperCase() || 'V'}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Title */}
                                        <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-neutral-200 transition">
                                            {purchase.video.title}
                                        </h3>

                                        {/* Purchase Info */}
                                        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                                            <span className="font-medium text-green-400">
                                                {formatSolAmount(purchase.amount_paid)} SOL
                                            </span>
                                            <span>•</span>
                                            <span>{formatDate(purchase.created_at)}</span>
                                        </div>

                                        {/* Transaction */}
                                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                                            <Wallet className="w-3 h-3" />
                                            <span className="truncate">{formatAddress(purchase.transaction_signature)}</span>
                                        </div>

                                        {/* Status Badge */}
                                        {purchase.status === 'completed' && (
                                            <div className="mt-2">
                                                <Badge className="bg-green-900/30 text-green-400 border-green-700 text-xs">
                                                    Completed
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
