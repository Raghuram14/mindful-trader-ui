/**
 * Trade Import Page
 * 
 * Main page for importing trades from CSV files
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeImport } from '../hooks/useTradeImport';
import { ImportDropzone } from '../components/ImportDropzone';
import { ImportProgress } from '../components/ImportProgress';
import { ImportSummary } from '../components/ImportSummary';
import { ImportHelpModal } from '../components/ImportHelpModal';
import { HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrades } from '@/context/TradeContext';

export default function TradeImportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadTrades } = useTrades();
  const [file, setFile] = useState<File | null>(null);
  const [broker, setBroker] = useState<string>('GENERIC');
  const [fileType, setFileType] = useState<'EQ' | 'FO'>('EQ');
  const [showHelp, setShowHelp] = useState(false);

  const { isImporting, progress, result, error, importTrades, reset } = useTradeImport();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    reset();
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const importResult = await importTrades(file, { broker, fileType });
      // Reload trades to show newly imported ones
      await loadTrades();
      toast({
        title: 'Import successful',
        description: `${importResult.reconstructedTrades} trades imported successfully.`,
      });
    } catch (err) {
      toast({
        title: 'Import failed',
        description: error || 'Failed to import trades. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewTrades = () => {
    navigate('/history');
  };

  const canImport = file && !isImporting && progress === 'idle';

  return (
    <AppLayout>
      <div className="page-container animate-fade-in">
        <header className="mb-8">
          <h1 className="page-title">Import Your Past Trades</h1>
          <p className="page-subtitle mt-1">
            Bring your existing trades to MindfulTrade for behavioral analysis.
          </p>
        </header>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Help Link */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              What gets imported?
            </button>
          </div>

          {/* Import Form */}
          {progress === 'idle' && !result && (
            <div className="space-y-6">
              {/* File Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="fileType">File Type</Label>
                <Select value={fileType} onValueChange={(value) => setFileType(value as 'EQ' | 'FO')}>
                  <SelectTrigger id="fileType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQ">Equity (EQ)</SelectItem>
                    <SelectItem value="FO">Futures & Options (FO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Broker Selection */}
              <div className="space-y-2">
                <Label htmlFor="broker">Broker</Label>
                <Select value={broker} onValueChange={setBroker}>
                  <SelectTrigger id="broker">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERIC">Generic</SelectItem>
                    <SelectItem value="ZERODHA">Zerodha</SelectItem>
                    <SelectItem value="ANGELONE">Angel One</SelectItem>
                    <SelectItem value="UPSTOX">Upstox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dropzone */}
              <div className="space-y-2">
                <Label>CSV File</Label>
                <ImportDropzone
                  onFileSelect={handleFileSelect}
                  disabled={isImporting}
                  acceptedFile={file}
                />
              </div>

              {/* Import Button */}
              <div className="flex gap-3">
                <Button
                  onClick={handleImport}
                  disabled={!canImport}
                  className="flex-1"
                >
                  Import Trades
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/history')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Progress */}
          {isImporting && (
            <div className="card-calm">
              <h3 className="font-semibold text-foreground mb-4">Importing...</h3>
              <ImportProgress progress={progress} />
            </div>
          )}

          {/* Error */}
          {error && progress === 'error' && (
            <div className="card-calm border-l-4 border-l-red-500/40 bg-red-500/5">
              <p className="text-sm text-foreground mb-4">{error}</p>
              <Button onClick={reset} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Summary */}
          {result && progress === 'complete' && (
            <div className="space-y-6">
              <ImportSummary result={result} />
              <div className="flex gap-3">
                <Button onClick={handleViewTrades} className="flex-1">
                  View Trades
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    reset();
                    setFile(null);
                  }}
                >
                  Import Another
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Help Modal */}
        <ImportHelpModal open={showHelp} onClose={() => setShowHelp(false)} />
      </div>
    </AppLayout>
  );
}

