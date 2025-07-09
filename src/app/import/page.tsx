'use client';

import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import CsvUpload from '@/components/CsvUpload';
import ImportResults from '@/components/ImportResults';
import { ImportResult } from '@/types/import';

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setImportResults(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setError(null);
    setImportResults(null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/movies/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const results: ImportResult = await response.json();
      setImportResults(results);
      
      // Clear file selection after successful import
      setSelectedFile(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/movies/import');
      if (!response.ok) throw new Error('Failed to fetch template');
      
      const templateData = await response.json();
      
      // Create CSV content
      const csvContent = [
        templateData.headers.join(','),
        // Add example row
        `"${templateData.example[0].code}","${templateData.example[0].title}","${templateData.example[0].description}","${templateData.example[0].videoUrl}","${templateData.example[0].coverUrl}",${templateData.example[0].isFavourite},${templateData.example[0].rating},"${templateData.example[0].publishedAt}"`
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'movie-import-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download template:', err);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Import Movies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload a CSV file to import multiple movies into your database
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
          <button
            onClick={() => window.open('/api/movies/import', '_blank')}
            className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Format Guide
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Section */}
          {!importResults && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <CsvUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={error || undefined}
              />

              {/* Import Button */}
              {selectedFile && !isUploading && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleImport}
                    disabled={isUploading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Import Movies
                  </button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <p className="text-red-800 dark:text-red-200 font-medium">
                      Import Error
                    </p>
                  </div>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {importResults && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <ImportResults 
                results={importResults} 
                onClose={resetImport}
              />
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Import Tips
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Movies with duplicate codes will be skipped automatically
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Optional fields will use default values if not provided
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Large files are processed in batches for better performance
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              You can export error details to fix issues in your CSV file
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
