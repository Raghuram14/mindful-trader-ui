import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { suggestionsApi, CreateSuggestionRequest } from '@/api/suggestions';
import { MessageSquare, Star, Sparkles, Send, CheckCircle2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'user_experience', label: 'User Experience', icon: MessageSquare },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb },
  { value: 'bug_report', label: 'Bug Report', icon: '🐛' },
  { value: 'performance', label: 'Performance', icon: '⚡' },
  { value: 'usability', label: 'Usability', icon: '🎯' },
  { value: 'general_feedback', label: 'General Feedback', icon: '💬' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function SuggestionsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<CreateSuggestionRequest>({
    category: '',
    userExperience: '',
    usefulnessRating: undefined,
    enhancements: '',
    additionalFeedback: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast({
        title: 'Category Required',
        description: 'Please select a category for your suggestion',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await suggestionsApi.create(formData);
      
      setIsSubmitted(true);
      toast({
        title: 'Thank You! 🎉',
        description: 'Your feedback has been submitted successfully. We appreciate your input!',
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          category: '',
          userExperience: '',
          usefulnessRating: undefined,
          enhancements: '',
          additionalFeedback: '',
        });
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit suggestion',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, usefulnessRating: rating }));
  };

  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <Card className="w-full max-w-md border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-muted-foreground">
                Your feedback has been received and will help us improve the platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-10 w-10 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Share Your Thoughts</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your feedback helps us build a better trading experience. Share your experiences, 
            suggestions, and ideas to help shape the future of Mindful Trader.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Category Selection */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Feedback Category
                </CardTitle>
                <CardDescription>
                  Select the category that best describes your feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span>{typeof cat.icon === 'string' ? cat.icon : null}</span>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* User Experience */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Your Experience</CardTitle>
                <CardDescription>
                  Tell us about your experience using Mindful Trader
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Share your thoughts on what you like, what works well, or any challenges you've faced..."
                  value={formData.userExperience}
                  onChange={(e) => setFormData(prev => ({ ...prev, userExperience: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Usefulness Rating */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  How useful is Mindful Trader?
                </CardTitle>
                <CardDescription>
                  Rate how useful this platform has been for your trading journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      className={cn(
                        "p-2 rounded-lg transition-all transform hover:scale-110",
                        formData.usefulnessRating && rating <= formData.usefulnessRating
                          ? "text-yellow-500"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    >
                      <Star
                        className="h-10 w-10"
                        fill={formData.usefulnessRating && rating <= formData.usefulnessRating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {formData.usefulnessRating ? `${formData.usefulnessRating} out of 5 stars` : 'Tap to rate'}
                </p>
              </CardContent>
            </Card>

            {/* Enhancement Suggestions */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Enhancement Ideas
                </CardTitle>
                <CardDescription>
                  What features or improvements would make this platform more valuable for you?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe any new features, improvements, or changes you'd like to see..."
                  value={formData.enhancements}
                  onChange={(e) => setFormData(prev => ({ ...prev, enhancements: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Additional Feedback */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle>Additional Thoughts</CardTitle>
                <CardDescription>
                  Anything else you'd like us to know? We're all ears!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Share any other comments, questions, or suggestions..."
                  value={formData.additionalFeedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalFeedback: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !formData.category}
                className="min-w-[200px] h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Your feedback is anonymous and will be used solely to improve the platform.
            Thank you for helping us build a better trading experience! 🙏
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
