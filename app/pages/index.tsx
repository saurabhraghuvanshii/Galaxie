'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { CreateVideoButton } from '@/app/components/CreateVideoButton';
import { VideoCard } from '@/app/components/VideoCard';
import { useWallet } from '@/app/contexts/WalletContext';
import { Home, Flame, Wallet, Play } from 'lucide-react';

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

const Index = () => {
    const { walletAddress } = useWallet();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos');
            if (!response.ok) throw new Error('Failed to fetch videos');
            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const allVideos = videos.filter(v => !v.is_live);
    const liveVideos = videos.filter(v => v.is_live);
    const paidVideos = videos.filter(v => v.is_paid);

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-neutral-950 border-b border-neutral-800">
                <div className="w-full px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/Galaxie1.png"
                            alt="Galaxie Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h1 className="text-lg font-bold md:text-xl bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            Galaxie
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {walletAddress && <CreateVideoButton />}
                        <PhantomWalletButton />
                    </div>
                </div>
            </header>

            <main className="max-w-[1800px] mx-auto px-4 py-6">
                <Tabs defaultValue="all" className="w-full">
                    {/* Tabs Navigation */}
                    <TabsList className="w-full bg-transparent  rounded-none h-auto p-0 mb-6">
                        <div className="flex gap-1 overflow-x-auto">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white hover:bg-neutral-900 rounded-lg px-4 py-2 transition-all flex items-center gap-2 font-medium text-sm cursor-pointer"
                            >
                                <Home className="w-4 h-4" />
                                <span>All Videos</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="paid"
                                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white hover:bg-neutral-900 rounded-lg px-4 py-2 transition-all flex items-center gap-2 font-medium text-sm cursor-pointer"
                            >
                                <Wallet className="w-4 h-4" />
                                <span>Paid</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="live"
                                className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white hover:bg-neutral-900 rounded-lg px-4 py-2 transition-all flex items-center gap-2 font-medium text-sm cursor-pointer"
                            >
                                <Flame className="w-4 h-4 text-red-500" />
                                <span>Live</span>
                            </TabsTrigger>
                        </div>
                    </TabsList>

                    {/* All Videos Tab */}
                    <TabsContent value="all" className="mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-neutral-400">Loading videos...</p>
                                </div>
                            </div>
                        ) : allVideos.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center max-w-md">
                                    <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Play className="w-10 h-10 text-neutral-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                                    <p className="text-neutral-400 text-sm">
                                        Be the first to upload a video to Galaxie!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {allVideos.map((video) => (
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
                                        createdAt={video.created_at}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Live Videos Tab */}
                    <TabsContent value="live" className="mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-neutral-400">Loading live videos...</p>
                                </div>
                            </div>
                        ) : liveVideos.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center max-w-lg">
                                    <div className="w-20 h-20 bg-linear-to-br from-red-900 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Flame className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No live streams</h3>
                                    <p className="text-neutral-400 text-sm mb-4">
                                        There are no live streams at the moment.
                                    </p>
                                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-300">
                                        <p className="font-medium mb-1">💡 Coming Soon</p>
                                        <p>Live streaming feature will be available in future updates. Stay tuned!</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {liveVideos.map((video) => (
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
                                        createdAt={video.created_at}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Paid Videos Tab */}
                    <TabsContent value="paid" className="mt-0">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-neutral-400">Loading paid videos...</p>
                                </div>
                            </div>
                        ) : paidVideos.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center max-w-md">
                                    <div className="w-20 h-20 bg-linear-to-br from-green-900 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Wallet className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No paid videos yet</h3>
                                    <p className="text-neutral-400 text-sm">
                                        Creators haven't uploaded any paid content yet. Check back soon!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {paidVideos.map((video) => (
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
                                        createdAt={video.created_at}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Index;
