'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/app/components/ui/dialog';
import { toast } from 'sonner';
import { User, Upload, X } from 'lucide-react';

interface EditProfileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    walletAddress: string;
    currentProfile?: {
        username?: string;
        display_name?: string;
        bio?: string;
        avatar_url?: string;
    };
    onProfileUpdate?: () => void;
}

export const EditProfileDialog = ({
    isOpen,
    onClose,
    walletAddress,
    currentProfile,
    onProfileUpdate
}: EditProfileDialogProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: currentProfile?.username || '',
        display_name: currentProfile?.display_name || '',
        bio: currentProfile?.bio || '',
        avatar_url: currentProfile?.avatar_url || '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile?.avatar_url || null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB max
                toast.error('File size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                setAvatarPreview(result);
                setFormData({ ...formData, avatar_url: result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet_address: walletAddress,
                    ...formData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            toast.success('Profile updated successfully!');
            onProfileUpdate?.();
            onClose();

            // Redirect to username URL if username was set
            if (formData.username && formData.username !== currentProfile?.username) {
                router.push(`/user/${formData.username}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview(null);
        setFormData({ ...formData, avatar_url: '' });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border border-green-500 bg-background/95 backdrop-blur-sm p-6 shadow-lg rounded-lg max-w-md mx-auto font-roboto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-roboto font-bold leading-none tracking-tight text-green-600">
                        Edit Profile
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-green-500 flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-gray-400" />
                                )}
                            </div>
                            {avatarPreview && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                    onClick={removeAvatar}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            )}
                        </div>

                        <div className="text-center">
                            <Label htmlFor="avatar" className="cursor-pointer">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Upload Image
                                </div>
                            </Label>
                            <input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                128 x 128 px min, 5MB max
                            </p>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <Label htmlFor="username" className="font-roboto font-bold text-green-600 text-base">
                            Username (Optional)
                        </Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Remove spaces and limit to 15 characters
                                const cleanValue = value.replace(/\s/g, '').slice(0, 15);
                                setFormData({ ...formData, username: cleanValue });
                            }}
                            placeholder="Enter username (max 15 chars, no spaces)"
                            maxLength={15}
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                        {formData.username.length > 15 && (
                            <p className="text-red-500 text-sm mt-1 font-roboto">
                                Username must be 15 characters or less
                            </p>
                        )}
                    </div>

                    {/* Display Name */}
                    <div>
                        <Label htmlFor="display_name" className="font-roboto font-bold text-green-600 text-base">
                            Display Name (Optional)
                        </Label>
                        <Input
                            id="display_name"
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            placeholder="Enter display name"
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <Label htmlFor="bio" className="font-roboto font-bold text-green-600 text-base">
                            Bio (Optional)
                        </Label>
                        <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={3}
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="border border-red-500 hover:border-red-600 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="border border-green-500 hover:border-green-600 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
