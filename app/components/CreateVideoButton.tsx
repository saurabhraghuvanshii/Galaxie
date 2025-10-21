'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { UploadVideoDialog } from './UploadVideoDialog';
import { useWallet } from '@/app/contexts/WalletContext';
import { toast } from 'sonner';

export const CreateVideoButton = () => {
    const { walletAddress } = useWallet();
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [isPaidVideo, setIsPaidVideo] = useState(false);

    const handleUploadClick = (isPaid: boolean) => {
        if (!walletAddress) {
            toast.error('Please connect your wallet first');
            return;
        }
        setIsPaidVideo(isPaid);
        setUploadDialogOpen(true);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="rounded-full h-10 px-4 bg-green-900 hover:bg-green-800 cursor-pointer flex items-center gap-2">
                        <Plus className="h-6 w-6" />
                        <span className="font-roboto font-bold text-sm">Create</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUploadClick(false)} className="flex items-center gap-2 hover:bg-gray-800 cursor-pointer">
                        <img src="/youtube.svg" alt="YouTube" className="w-4 h-4" />
                        Upload Video
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUploadClick(true)} className="flex items-center gap-2 hover:bg-gray-800 cursor-pointer">
                        <img src="/youtube.svg" alt="YouTube" className="w-4 h-4" />
                        Upload Paid Video
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <UploadVideoDialog
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                isPaid={isPaidVideo}
            />
        </>
    );
};
