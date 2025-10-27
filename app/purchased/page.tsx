'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/app/contexts/WalletContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Loader2, ShoppingBag, Calendar, Wallet, Play, Home } from 'lucide-react';
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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    const formatSolAmount = (lamports: string) => {
        const amount = parseFloat(lamports) / 1e9;
        // Remove trailing zeros and show original precision
        return amount.toString();
    };

    const getEmbedUrl = (youtubeUrl: string) => {
        return youtubeUrl.replace("watch", "embed").replace("?v=", "/");
    };

    if (!walletAddress) {
        return (
            <div className="min-h-screen">
                <div className="border-b border-0 border-green-900 sticky backdrop-blur">
                    <div className="w-full px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Galaxie1.png"
                                alt="Galaxie Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <h1 className="text-base font-roboto font-bold md:text-xl">Galaxie</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <PhantomWalletButton />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Card className="w-full max-w-md">
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Connect Your Wallet</h3>
                                <p className="text-gray-500 text-center mb-6">
                                    Please connect your wallet to view your purchased videos
                                </p>
                                <PhantomWalletButton />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen">
                <div className="border-b border-0 border-green-900 sticky backdrop-blur">
                    <div className="w-full px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Galaxie1.png"
                                alt="Galaxie Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <h1 className="text-base font-roboto font-bold md:text-xl">Galaxie</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <PhantomWalletButton />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen">
                <div className="border-b border-0 border-green-900 sticky backdrop-blur">
                    <div className="w-full px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/Galaxie1.png"
                                alt="Galaxie Logo"
                                width={40}
                                height={40}
                                className="rounded-lg"
                            />
                            <h1 className="text-base font-roboto font-bold md:text-xl">Galaxie</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <PhantomWalletButton />
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Card className="w-full max-w-md">
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <div className="text-red-500 mb-4">⚠️</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Videos</h3>
                                <p className="text-gray-500 text-center mb-6">{error}</p>
                                <Button onClick={fetchPurchasedVideos} variant="outline">
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="border-b border-0 border-green-900 sticky backdrop-blur">
                <div className="w-full px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/Galaxie1.png"
                            alt="Galaxie Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h1 className="text-base font-roboto font-bold md:text-xl">Galaxie</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => router.push('/')}
                            size="sm"
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Home className="w-4 h-4 cursor-pointer" />
                        </Button>
                        {walletAddress && <CreateVideoButton />}
                        <PhantomWalletButton />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-green-500 mb-2">Purchased Videos</h2>
                    <p className="text-green-600">Your collection of purchased videos</p>
                </div>

                {purchases.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Card className="border border-green-800 w-full max-w-md">
                            <CardContent className="flex flex-col items-center justify-center py-8">
                                <ShoppingBag className="w-16 h-16 text-green-700 mb-4" />
                                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Purchased Videos</h3>
                                <p className="text-gray-400 text-center mb-6">
                                    You haven't purchased any videos yet. Start exploring and buying videos!
                                </p>
                                <Button onClick={() => router.push('/')} variant="outline" className="cursor-pointer border border-green-800 hover:bg-green-800">
                                    Browse Videos
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
                        {purchases.map((purchase) => (
                            <Card key={purchase.id} className="overflow-hidden border border-green-900 hover:border-green-700 hover:shadow-lg transition-shadow">
                                <div className="relative aspect-video">
                                    <iframe
                                        className="w-full h-full rounded-lg"
                                        src={getEmbedUrl(purchase.video.youtube_url)}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                            <Play className="w-3 h-3 mr-1" />
                                            Purchased
                                        </Badge>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="mb-2">
                                        <Badge variant="outline" className="text-green-600 border-green-600 mb-2">
                                            {purchase.status === 'completed' ? 'Completed' : purchase.status}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{purchase.video.title}</h3>

                                    {/* Description */}
                                    {purchase.video.description && (
                                        <div className="mb-3">
                                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                                <p className="text-xs text-gray-100 leading-relaxed line-clamp-2">
                                                    {purchase.video.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Purchase Details */}
                                    <div className="space-y-2 text-xs mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Amount Paid:</span>
                                            <span className="text-gray-100 font-semibold">
                                                {formatSolAmount(purchase.amount_paid)} SOL
                                            </span>
                                        </div>
                                        {/* {parseFloat(purchase.platform_fee) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Platform Fee:</span>
                                                <span className="text-gray-100">
                                                    {formatSolAmount(purchase.platform_fee)} SOL
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-300">Creator Payout:</span>
                                            <span className="text-gray-100">
                                                {formatSolAmount(purchase.creator_payout)} SOL
                                            </span>
                                        </div> */}
                                    </div>

                                    {/* Transaction Info */}
                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-400">
                                                {formatDate(purchase.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-3 h-3 text-gray-400" />
                                            <span className="text-gray-400 break-all">
                                                {formatAddress(purchase.transaction_signature)}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
