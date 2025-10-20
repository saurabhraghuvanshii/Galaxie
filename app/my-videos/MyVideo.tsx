'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { VideoCard } from '@/app/components/VideoCard';
import { supabase } from '@/app/integrations/supabase/client';
import { useWallet } from '@/app/contexts/WalletContext';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Video {
    id: string;
    youtube_url: string;
    title: string;
    thumbnail_url: string | null;
    sol_price: number | null;
    is_paid: boolean | null;
    is_live: boolean | null;
}

const MyVideos = () => {
    const { walletAddress } = useWallet();
    const router = useRouter();
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!walletAddress) {
            toast.error('Please connect your wallet');
            router.push('/');
            return;
        }

        fetchMyVideos();
    }, [walletAddress, router]);

    const fetchMyVideos = async () => {
        try {
            const { data, error } = await supabase
                .from('videos')
                .select('*')
                .eq('wallet_address', walletAddress!)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVideos(data || []);
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error('Failed to load your videos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-3xl font-bold">My Videos</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading your videos...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">You haven't uploaded any videos yet</p>
                        <Button onClick={() => router.push('/')} className="mt-4">
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
                                thumbnailUrl={video.thumbnail_url || undefined}
                                solPrice={video.sol_price || 0}
                                isPaid={video.is_paid || false}
                                isLive={video.is_live || false}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVideos;
