import { useState } from 'react';
import { useRules } from '@/context/RulesContext';
import { UserProfile } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProfileSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSetup({ open, onOpenChange }: ProfileSetupProps) {
  const { profile, updateProfile } = useRules();
  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      name: '',
      experienceLevel: 'INTERMEDIATE',
      accountSize: 100000,
      tradingStyle: 'MIXED',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Setup</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">First Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Trading Experience</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value: UserProfile['experienceLevel']) =>
                setFormData({ ...formData, experienceLevel: value })
              }
            >
              <SelectTrigger id="experience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Beginner (&lt;1 year)</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate (1–3 years)</SelectItem>
                <SelectItem value="EXPERIENCED">Experienced (3+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountSize">Current Account Size (₹)</Label>
            <Input
              id="accountSize"
              type="number"
              value={formData.accountSize}
              onChange={(e) =>
                setFormData({ ...formData, accountSize: Number(e.target.value) })
              }
              placeholder="100000"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tradingStyle">Trading Style</Label>
            <Select
              value={formData.tradingStyle}
              onValueChange={(value: UserProfile['tradingStyle']) =>
                setFormData({ ...formData, tradingStyle: value })
              }
            >
              <SelectTrigger id="tradingStyle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTRADAY">Intraday</SelectItem>
                <SelectItem value="SWING">Swing</SelectItem>
                <SelectItem value="MIXED">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              Save Profile
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

