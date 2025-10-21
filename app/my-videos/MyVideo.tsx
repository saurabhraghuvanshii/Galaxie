'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { VideoCard } from '@/app/components/VideoCard';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { CreateVideoButton } from '@/app/components/CreateVideoButton';
import { useWallet } from '@/app/contexts/WalletContext';
import { ArrowLeft, Home } from 'lucide-react';
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
}

const MyVideos = () => {
    const { walletAddress } = useWallet();
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (walletAddress) {
            fetchMyVideos();
        } else {
            setLoading(false);
        }
    }, [walletAddress]);

    const fetchMyVideos = async () => {
        try {
            const response = await fetch(`/api/videos/${walletAddress}`);
            if (!response.ok) throw new Error('Failed to fetch videos');
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error('Failed to load your videos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-0 border-green-900 sticky backdrop-blur">
                <div className="w-full px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="h-10 w-10 hover:bg-gray-800 cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Image
                            src="/Galaxie1.png"
                            alt="Galaxie Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h1 className="text-base font-roboto font-bold md:text-xl">My Videos</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateVideoButton />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="h-10 w-10 hover:bg-gray-800 cursor-pointer"
                        >
                            <Home className="h-5 w-5" />
                        </Button>
                        <PhantomWalletButton />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 pt-12 pb-6">
                {!walletAddress ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">Please connect your wallet to view your videos</p>
                        <p className="text-sm text-muted-foreground mb-6">Connect your wallet on the home page first, then return here to see your videos.</p>
                        <Button onClick={() => router.push('/')} className="mt-4">
                            Go to Home & Connect Wallet
                        </Button>
                    </div>
                ) : loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading your videos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">You haven't uploaded any videos yet</p>
                        <Button onClick={() => router.push('/')} className="mt-4">
                            <img src="/youtube.svg" alt="YouTube" className="w-4 h-4 mr-2" />
                            Upload Your First Video
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {videos.map((video) => (
                            <VideoCard
                                key={video.id}
                                id={video.id}
                                youtubeUrl={video.youtube_url}
                                title={video.title}
                                description={video.description || undefined}
                                thumbnailUrl={video.thumbnail_url || undefined}
                                solPrice={video.sol_price || 0}
                                isPaid={video.is_paid || false}
                                isLive={video.is_live || false}
                                walletAddress={video.wallet_address}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyVideos;
