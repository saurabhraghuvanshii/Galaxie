'use client';

import { Button } from '@/app/components/ui/button';
import { useWallet } from '@/app/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

export const PhantomWalletButton = () => {
    const { walletAddress, connectWallet, disconnectWallet, isConnecting } = useWallet();
    const router = useRouter();

    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    if (!walletAddress) {
        return (
            <Button onClick={connectWallet} disabled={isConnecting} className="gap-2">
                <img
                    src="Phantom-Icon_App.svg"
                    alt="Phantom"
                    className="w-5 h-5"
                />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <img
                        src="Phantom-Icon_App.svg"
                        alt="Phantom"
                        className="w-5 h-5"
                    />
                    {formatAddress(walletAddress)}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/my-videos')}>
                    My Videos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={disconnectWallet}>
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
