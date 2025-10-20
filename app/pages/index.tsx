'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { CreateVideoButton } from '@/app/components/CreateVideoButton';
import { VideoCard } from '@/app/components/VideoCard';
import { supabase } from '@/app/integrations/supabase/client';
import { useWallet } from '@/app/contexts/WalletContext';

interface Video {
    id: string;
    youtube_url: string;
    title: string;
    thumbnail_url: string | null;
    sol_price: number | null;
    is_paid: boolean | null;
    is_live: boolean | null;
}

const Index = () => {
    const { walletAddress } = useWallet();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();

        const channel = supabase
            .channel('videos-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'videos'
                },
                () => {
                    fetchVideos();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchVideos = async () => {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVideos(data || []);
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
        <div className="min-h-screen bg-background">
            <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">VideoHub</h1>
                    <div className="flex items-center gap-3">
                        {walletAddress && <CreateVideoButton />}
                        <PhantomWalletButton />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                        <TabsTrigger value="all">All Videos</TabsTrigger>
                        <TabsTrigger value="live">Live</TabsTrigger>
                        <TabsTrigger value="paid">Paid</TabsTrigger>
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
                                        thumbnailUrl={video.thumbnail_url || undefined}
                                        solPrice={video.sol_price || 0}
                                        isPaid={video.is_paid || false}
                                        isLive={video.is_live || false}
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
                                        thumbnailUrl={video.thumbnail_url || undefined}
                                        solPrice={video.sol_price || 0}
                                        isPaid={video.is_paid || false}
                                        isLive={video.is_live || false}
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
                                        thumbnailUrl={video.thumbnail_url || undefined}
                                        solPrice={video.sol_price || 0}
                                        isPaid={video.is_paid || false}
                                        isLive={video.is_live || false}
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
