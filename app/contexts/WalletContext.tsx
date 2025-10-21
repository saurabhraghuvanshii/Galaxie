"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

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

    useEffect(() => {
        const checkIfWalletIsConnected = async () => {
            try {
                const { solana } = window as any;
                if (solana?.isPhantom) {
                    if (solana.isConnected) {
                        const response = await solana.connect({ onlyIfTrusted: true });
                        setWalletAddress(response.publicKey.toString());
                    }
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
                try {
                    const { solana } = window as any;
                    if (solana?.isPhantom) {
                        const response = await solana.connect();
                        setWalletAddress(response.publicKey.toString());
                    }
                } catch (reconnectError) {
                    console.error('Error reconnecting wallet:', reconnectError);
                }
            }
        };

        // Add a small delay to ensure Phantom is loaded
        setTimeout(checkIfWalletIsConnected, 100);

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
            setWalletAddress(response.publicKey.toString());
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
                setWalletAddress(null);
            }
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
