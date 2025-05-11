'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloudIcon, AlertCircle } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUploadSuccess: (uploadedFileId: string) => void;
}

export function FileUploadModal({
  isOpen,
  onOpenChange,
  onUploadSuccess,
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null); // Clear previous errors
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('needToEmbed', 'true'); // As per your API requirement

    try {
      const response = await fetch('/api/files/upload', {
        // Your API endpoint
        method: 'POST',
        body: formData,
        // Headers are not strictly necessary for FormData by default fetch
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.success && result.fileId) {
        onUploadSuccess(result.fileId);
        handleClose();
      } else {
        throw new Error(
          result.error || 'Upload completed but no file ID returned.',
        );
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UploadCloudIcon className="mr-2 h-5 w-5" /> Upload New File
          </DialogTitle>
          <DialogDescription>
            Select a file from your computer to upload. Supported types include
            PDF, DOCX, TXT, etc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label htmlFor="file-upload" className="sr-only">
              Choose file
            </Label>
            <Input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 dark:file:bg-primary/20 dark:file:text-primary dark:hover:file:bg-primary/30 cursor-pointer"
            />
          </div>
          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              Selected file: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
          {error && (
            <div className="flex items-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                'Upload File'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
