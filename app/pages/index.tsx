'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { CreateVideoButton } from '@/app/components/CreateVideoButton';
import { VideoCard } from '@/app/components/VideoCard';
import { useWallet } from '@/app/contexts/WalletContext';

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
        <div className="min-h-screen">
            <div className="border-b border-0 sticky backdrop-blur">
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
                        {walletAddress && <CreateVideoButton />}
                        <PhantomWalletButton />
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-6">
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-auto max-w-none grid-cols-3 mb-6 bg-transparent justify-start">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent font-roboto font-bold text-base"
                        >
                            All Videos
                        </TabsTrigger>
                        <TabsTrigger
                            value="paid"
                            className="data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent font-roboto font-bold text-base"
                        >
                            Paid
                        </TabsTrigger>
                        <TabsTrigger
                            value="live"
                            className="data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent font-roboto font-bold text-base"
                        >
                            Live
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Loading videos...</p>
                            </div>
                        ) : allVideos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No videos available yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="live">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Loading live videos...</p>
                            </div>
                        ) : liveVideos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No live videos at the moment</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="paid">
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Loading paid videos...</p>
                            </div>
                        ) : paidVideos.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No paid videos available yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
