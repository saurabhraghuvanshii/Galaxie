'use client';

import { Button } from '@/app/components/ui/button';
import { useWallet } from '@/app/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
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
            <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="gap-2 border-2 border-purple-500 hover:border-purple-600 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
                <img
                    src="Phantom-Icon_App.svg"
                    alt="Phantom"
                    className="w-5 h-5"
                />
                {isConnecting ? 'Connecting...' : 'Login'}
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border border-green-500 hover:border-green-600 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-sm text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <img
                        src="Phantom-Icon_App.svg"
                        alt="Phantom"
                        className="w-5 h-5"
                    />
                    {formatAddress(walletAddress)}
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/my-videos')} className="flex items-center gap-2 hover:bg-gray-800 cursor-pointer">
                    <img src="/youtube.svg" alt="YouTube" className="w-4 h-4" />
                    My Videos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={disconnectWallet} className="hover:bg-gray-800 cursor-pointer">
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
