'use client';

import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';

interface VideoCardProps {
    id: string;
    youtubeUrl: string;
    title: string;
    thumbnailUrl?: string;
    solPrice: number;
    isPaid: boolean;
    isLive: boolean;
}

export const VideoCard = ({ youtubeUrl, title, thumbnailUrl, solPrice, isPaid, isLive }: VideoCardProps) => {
    // Extract YouTube video ID
    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const videoId = getYoutubeId(youtubeUrl);
    const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-video">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                {isLive && (
                    <Badge variant="destructive" className="absolute top-2 left-2">
                        LIVE
                    </Badge>
                )}
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h3>
                {isPaid && (
                    <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{solPrice} SOL</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
