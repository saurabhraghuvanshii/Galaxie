'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { useWallet } from '@/app/contexts/WalletContext';
import { toast } from 'sonner';

interface UploadVideoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPaid: boolean;
}

export const UploadVideoDialog = ({ open, onOpenChange, isPaid }: UploadVideoDialogProps) => {
    const { walletAddress } = useWallet();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        youtubeUrl: '',
        title: '',
        description: '',
        solPrice: '0',
        thumbnailUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!walletAddress) {
            toast.error('Please connect your wallet first');
            return;
        }

        setLoading(true);

        try {
            const requestData = {
                wallet_address: walletAddress,
                youtube_url: formData.youtubeUrl,
                title: formData.title,
                description: formData.description,
                thumbnail_url: formData.thumbnailUrl || null,
                sol_price: isPaid ? parseFloat(formData.solPrice) : 0,
                is_paid: isPaid,
                is_live: false
            };

            console.log('Sending video data:', requestData);

            const response = await fetch('/api/videos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload video');
            }

            const result = await response.json();
            console.log('Video created successfully:', result);
            toast.success('Video uploaded successfully!');
            onOpenChange(false);
            setFormData({
                youtubeUrl: '',
                title: '',
                description: '',
                solPrice: '0',
                thumbnailUrl: ''
            });
        } catch (error) {
            console.error('Error uploading video:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload video';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isPaid ? 'Upload Paid Video' : 'Upload Free Video'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title" className="font-roboto font-bold text-green-600 text-base">Video Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter video title"
                            required
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <Label htmlFor="youtubeUrl" className="font-roboto font-bold text-green-600 text-base">YouTube URL</Label>
                        <Input
                            id="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description" className="font-roboto font-bold text-green-600 text-base">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter video description"
                            rows={3}
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <Label htmlFor="thumbnailUrl" className="font-roboto font-bold text-green-600 text-base">Custom Thumbnail URL (Optional)</Label>
                        <Input
                            id="thumbnailUrl"
                            value={formData.thumbnailUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            placeholder="https://..."
                            className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                        />
                    </div>

                    {isPaid && (
                        <div>
                            <Label htmlFor="solPrice" className="font-roboto font-bold text-green-600 text-base">Price (SOL)</Label>
                            <Input
                                id="solPrice"
                                type="number"
                                step="0.0001"
                                min="0"
                                value={formData.solPrice}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, solPrice: e.target.value })}
                                placeholder="0.00"
                                required
                                className="font-roboto border-green-500 focus:border-green-600 focus:ring-green-500"
                            />
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border border-red-500 hover:border-red-600 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="border border-green-500 hover:border-green-600 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-roboto font-bold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                            {loading ? 'Uploading...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
