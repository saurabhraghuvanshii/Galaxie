"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WalletContextType {
    walletAddress: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedWalletAddress = localStorage.getItem('walletAddress');
        if (savedWalletAddress) {
            setWalletAddress(savedWalletAddress);
        }
    }, []);

    useEffect(() => {

        const { solana } = window as any;
        if (solana?.isPhantom) {
            solana.on('accountChanged', (publicKey: any) => {
                if (publicKey) {
                    setWalletAddress(publicKey.toString());
                } else {
                    setWalletAddress(null);
                }
            });
        }

        return () => {
            if (solana?.isPhantom) {
                solana.removeAllListeners('accountChanged');
            }
        };
    }, []);

    const connectWallet = async () => {
        setIsConnecting(true);
        try {
            const { solana } = window as any;

            if (!solana?.isPhantom) {
                window.open('https://phantom.app/', '_blank');
                return;
            }

            const response = await solana.connect();
            const address = response.publicKey.toString();
            setWalletAddress(address);

            localStorage.setItem('walletAddress', address);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            const { solana } = window as any;
            if (solana?.isPhantom) {
                await solana.disconnect();
            }
            setWalletAddress(null);

            localStorage.removeItem('walletAddress');
            
            router.push('/');
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    };

    return (
        <WalletContext.Provider
            value={{ walletAddress, connectWallet, disconnectWallet, isConnecting }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
