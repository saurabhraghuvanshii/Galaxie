'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { supabase } from '@/app/integrations/supabase/client';
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
            const { error } = await supabase.from('videos').insert({
                wallet_address: walletAddress,
                youtube_url: formData.youtubeUrl,
                title: formData.title,
                description: formData.description,
                thumbnail_url: formData.thumbnailUrl || null,
                sol_price: isPaid ? parseFloat(formData.solPrice) : 0,
                is_paid: isPaid,
                is_live: false
            });

            if (error) throw error;

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
            toast.error('Failed to upload video');
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
                        <Label htmlFor="title">Video Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter video title"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="youtubeUrl">YouTube URL</Label>
                        <Input
                            id="youtubeUrl"
                            value={formData.youtubeUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter video description"
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="thumbnailUrl">Custom Thumbnail URL (Optional)</Label>
                        <Input
                            id="thumbnailUrl"
                            value={formData.thumbnailUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    {isPaid && (
                        <div>
                            <Label htmlFor="solPrice">Price (SOL)</Label>
                            <Input
                                id="solPrice"
                                type="number"
                                step="0.0001"
                                min="0"
                                value={formData.solPrice}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, solPrice: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Uploading...' : 'Submit'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
