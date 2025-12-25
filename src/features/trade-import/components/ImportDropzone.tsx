/**
 * Import Dropzone Component
 * 
 * Drag & drop CSV file upload
 */

import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedFile?: File | null;
}

export function ImportDropzone({ onFileSelect, disabled, acceptedFile }: ImportDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [disabled, onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        isDragging && !disabled
          ? "border-primary bg-primary/5"
          : "border-border bg-secondary/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id="csv-upload"
      />

      {acceptedFile ? (
        <div className="flex flex-col items-center gap-3">
          <FileText className="w-12 h-12 text-primary" />
          <div>
            <p className="font-medium text-foreground">{acceptedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(acceptedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-muted-foreground" />
          <div>
            <label
              htmlFor="csv-upload"
              className={cn(
                "cursor-pointer text-primary hover:underline font-medium",
                disabled && "cursor-not-allowed"
              )}
            >
              Click to browse
            </label>
            <span className="text-muted-foreground"> or drag & drop CSV file</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            We'll reconstruct your trades from execution data. Nothing is modified.
          </p>
        </div>
      )}
    </div>
  );
}

