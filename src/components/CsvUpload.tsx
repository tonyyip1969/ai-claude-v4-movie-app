'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CsvUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  className?: string;
}

export default function CsvUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading = false,
  uploadProgress = 0,
  error,
  className
}: CsvUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return false;
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return false;
    }
    
    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRemoveFile = () => {
    onFileRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAreaClick = () => {
    if (!selectedFile && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
          isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600',
          selectedFile 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : '',
          error 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : '',
          isUploading 
            ? 'pointer-events-none opacity-75' 
            : ''
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={isUploading}
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                File Selected
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-gray-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Processing...</span>
                  <span className="text-gray-600 dark:text-gray-400">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {error ? (
                <AlertCircle className="w-12 h-12 text-red-500" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {error ? 'Upload Error' : 'Upload CSV File'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {error ? error : 'Drag and drop your CSV file here, or click to browse'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supports CSV files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Format Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          CSV Format Requirements
        </h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong>Required columns:</strong> code, title, description, videoUrl
          </div>
          <div>
            <strong>Optional columns:</strong> coverUrl, isFavourite, rating, publishedAt
          </div>
          <div>
            <strong>Example:</strong>
            <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
              code,title,description,videoUrl,coverUrl,isFavourite,rating,publishedAt<br/>
              MOV001,&quot;Movie Title&quot;,&quot;Description&quot;,&quot;https://example.com/video.mp4&quot;,&quot;https://example.com/cover.jpg&quot;,false,8,&quot;2024-01-15&quot;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
