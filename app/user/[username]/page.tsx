'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/app/components/ui/button';
import { EditProfileDialog } from '@/app/components/EditProfileDialog';
import { VideoCard } from '@/app/components/VideoCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useWallet } from '@/app/contexts/WalletContext';
import { PhantomWalletButton } from '@/app/components/PhantomWalletButton';
import { ArrowLeft, Home, Edit3, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    wallet_address: string;
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    joined_date: string;
}

interface Video {
    id: string;
    youtube_url: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    sol_price: number | null;
    is_paid: boolean | null;
    is_live: boolean | null;
    wallet_address: string;
}

const UserProfilePage = () => {
    const params = useParams();
    const router = useRouter();
    const { walletAddress } = useWallet();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [videosLoading, setVideosLoading] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const username = params.username as string;

    useEffect(() => {
        fetchUserProfile();
    }, [username]);

    const fetchUserProfile = async () => {
        try {
            const isWalletAddress = username.length > 20;
            const url = isWalletAddress
                ? `/api/user/profile?wallet_address=${username}`
                : `/api/user/profile/${username}`;

            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    toast.error('User not found');
                    router.push('/');
                    return;
                }
                throw new Error('Failed to fetch user profile');
            }
            const data = await response.json();
            setProfile(data);

            fetchUserVideos(data.wallet_address);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.error('Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserVideos = async (userWalletAddress: string) => {
        setVideosLoading(true);
        try {
            const response = await fetch(`/api/videos/${userWalletAddress}`);
            if (response.ok) {
                const data = await response.json();
                setVideos(data);
            }
        } catch (error) {
            console.error('Error fetching user videos:', error);
        } finally {
            setVideosLoading(false);
        }
    };

    const formatWalletAddress = (address: string) => {
        if (address.length <= 6) return address;
        return `${address.slice(0, 3)}...${address.slice(-3)}`;
    };

    const formatJoinDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const copyWalletAddress = async () => {
        if (profile?.wallet_address) {
            await navigator.clipboard.writeText(profile.wallet_address);
            setCopied(true);
            toast.success('Wallet address copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isCurrentUser = walletAddress === profile?.wallet_address;

    useEffect(() => {
        if (profile?.username && username === profile.wallet_address) {
            router.replace(`/user/${profile.username}`);
        }
    }, [profile?.username, username, profile?.wallet_address, router]);

    const allVideos = videos;
    const paidVideos = videos.filter(video => video.is_paid);
    const freeVideos = videos.filter(video => !video.is_paid);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-0 border-green-900 sticky backdrop-blur">
                <div className="w-full px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="h-10 w-10 hover:bg-gray-800 cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Image
                            src="/Galaxie1.png"
                            alt="Galaxie Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <h1 className="text-base font-roboto font-bold md:text-xl">
                            {profile.display_name || 'User Profile'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="h-10 w-10 hover:bg-gray-800 cursor-pointer"
                        >
                            <Home className="h-5 w-5" />
                        </Button>
                        {walletAddress ? (
                            <PhantomWalletButton />
                        ) : (
                            <Button
                                onClick={() => router.push('/')}
                                className="gap-2 border-2 border-purple-500 hover:border-purple-600 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-sm text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                <img
                                    src="/Phantom-Icon_App.svg"
                                    alt="Phantom"
                                    className="w-5 h-5"
                                />
                                Login
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <main className="w-full">
                {/* Top Third - User Profile Info */}
                <div className="border-b border-green-900 pb-8 mb-8 px-4 py-8" style={{ minHeight: '25vh' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                            {/* Avatar */}
                            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gray-800 border-2 border-green-500 flex items-center justify-center overflow-hidden shrink-0">
                                {profile.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src="/Galaxie1.png"
                                        alt="Default Avatar"
                                        width={50}
                                        height={50}
                                        className="rounded-full sm:w-12 sm:h-12"
                                    />
                                )}
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                                {profile.display_name && (
                                    <h3 className="text-xl sm:text-2xl font-roboto font-bold text-white mb-2 truncate">
                                        {profile.display_name}
                                    </h3>
                                )}
                                {profile.username && (
                                    <h2 className="text-lg sm:text-xl font-roboto font-bold text-white mb-1 truncate">
                                        @{profile.username}
                                    </h2>
                                )}
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <img src="/wallet.svg" alt="Wallet" className="w-6 h-6 shrink-0" />
                                    <span className="text-sm sm:text-lg font-roboto font-bold text-white break-all">
                                        {profile.wallet_address}
                                    </span>
                                    <Button
                                        onClick={copyWalletAddress}
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 hover:bg-gray-700 shrink-0 cursor-pointer"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <img src="/calender.svg" alt="Calendar" className="w-6 h-6 shrink-0" />
                                    <span className="text-sm">
                                        Joined {formatJoinDate(profile.joined_date)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isCurrentUser && (
                            <Button
                                onClick={() => setEditDialogOpen(true)}
                                className="flex items-center gap-2 border border-green-500 hover:border-green-600 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-roboto font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base shrink-0"
                            >
                                <img src="/pencil.svg" alt="Edit" className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit Profile</span>
                                <span className="sm:hidden">Edit</span>
                            </Button>
                        )}
                    </div>

                    {profile.bio && (
                        <div className="mt-6">
                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                {profile.bio}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Half - User Videos with Tabs */}
                <div className="container mx-auto px-4 py-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="bg-transparent justify-start mb-6">
                            <TabsTrigger
                                value="all"
                                className="data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent font-roboto font-bold text-base cursor-pointer"
                            >
                                All Videos ({allVideos.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="paid"
                                className="data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent font-roboto font-bold text-base cursor-pointer"
                            >
                                Paid Videos ({paidVideos.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="free"
                                className="data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:bg-transparent font-roboto font-bold text-base cursor-pointer"
                            >
                                Free Videos ({freeVideos.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="pt-4">
                            {videosLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Loading videos...</p>
                                </div>
                            ) : allVideos.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No videos uploaded yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-5 w-full pt-4">
                                    {allVideos.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            id={video.id}
                                            youtubeUrl={video.youtube_url}
                                            title={video.title}
                                            description={video.description || undefined}
                                            thumbnailUrl={video.thumbnail_url || undefined}
                                            solPrice={video.sol_price || 0}
                                            isPaid={video.is_paid || false}
                                            isLive={video.is_live || false}
                                            walletAddress={video.wallet_address}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="paid" className="pt-4">
                            {videosLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Loading videos...</p>
                                </div>
                            ) : paidVideos.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No paid videos uploaded yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-5 w-full pt-4">
                                    {paidVideos.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            id={video.id}
                                            youtubeUrl={video.youtube_url}
                                            title={video.title}
                                            description={video.description || undefined}
                                            thumbnailUrl={video.thumbnail_url || undefined}
                                            solPrice={video.sol_price || 0}
                                            isPaid={video.is_paid || false}
                                            isLive={video.is_live || false}
                                            walletAddress={video.wallet_address}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="free" className="pt-4">
                            {videosLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Loading videos...</p>
                                </div>
                            ) : freeVideos.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No free videos uploaded yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-5 w-full pt-4">
                                    {freeVideos.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            id={video.id}
                                            youtubeUrl={video.youtube_url}
                                            title={video.title}
                                            description={video.description || undefined}
                                            thumbnailUrl={video.thumbnail_url || undefined}
                                            solPrice={video.sol_price || 0}
                                            isPaid={video.is_paid || false}
                                            isLive={video.is_live || false}
                                            walletAddress={video.wallet_address}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Edit Profile Dialog */}
            {isCurrentUser && (
                <EditProfileDialog
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    walletAddress={walletAddress!}
                    currentProfile={{
                        username: profile.username,
                        display_name: profile.display_name,
                        bio: profile.bio,
                        avatar_url: profile.avatar_url,
                    }}
                    onProfileUpdate={() => {
                        fetchUserProfile();
                    }}
                />
            )}
        </div>
    );
};

export default UserProfilePage;
