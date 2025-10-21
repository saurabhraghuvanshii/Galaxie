import { NextRequest, NextResponse } from 'next/server';
import { getVideos, createVideo } from '@/app/lib/types/database';
import { VideoCreateSchema } from '@/app/lib/types/index';

export async function GET() {
    try {
        const videos = await getVideos();
        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received video data:', body);

        // Validate the data with Zod schema
        const validatedData = VideoCreateSchema.parse(body);
        console.log('Validated data:', validatedData);

        const video = await createVideo(validatedData);
        return NextResponse.json(video, { status: 201 });
    } catch (error) {
        console.error('Error creating video:', error);

        // Handle Zod validation errors
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.message
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 });
    }
}
