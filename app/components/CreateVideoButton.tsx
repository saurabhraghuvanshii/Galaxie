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
                    <Button size="icon" className="rounded-full h-12 w-12">
                        <Plus className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUploadClick(false)}>
                        Upload Video
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUploadClick(true)}>
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
