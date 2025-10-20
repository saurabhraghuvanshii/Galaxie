'use client';

import { Toaster } from "@/app/components/ui/toaster";
import { Toaster as Sonner } from "@/app/components/ui/sonner";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "@/app/contexts/WalletContext";
import MyVideos from "./MyVideo";

const queryClient = new QueryClient();

export default function MyVideosPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <WalletProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <MyVideos />
                </TooltipProvider>
            </WalletProvider>
        </QueryClientProvider>
    );
}
