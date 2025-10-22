'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MyVideos from "./MyVideo";

const queryClient = new QueryClient();

export default function MyVideosPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <MyVideos />
        </QueryClientProvider>
    );
}
