'use client';

import { CheckCircle, AlertCircle, XCircle, Info, Download } from 'lucide-react';
import { ImportResult } from '@/types/import';
import { cn } from '@/lib/utils';

interface ImportResultsProps {
  results: ImportResult;
  onClose?: () => void;
  className?: string;
}

export default function ImportResults({ results, onClose, className }: ImportResultsProps) {
  const hasErrors = results.errorCount > 0;
  const hasSkipped = results.skippedCount > 0;
  const hasSuccess = results.successCount > 0;

  const getStatusColor = () => {
    if (hasErrors && results.successCount === 0) return 'text-red-600 dark:text-red-400';
    if (hasErrors || hasSkipped) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = () => {
    if (hasErrors && results.successCount === 0) return <XCircle className="w-6 h-6" />;
    if (hasErrors || hasSkipped) return <AlertCircle className="w-6 h-6" />;
    return <CheckCircle className="w-6 h-6" />;
  };

  const getStatusTitle = () => {
    if (hasErrors && results.successCount === 0) return 'Import Failed';
    if (hasErrors || hasSkipped) return 'Import Completed with Issues';
    return 'Import Successful';
  };

  const exportErrorsToCSV = () => {
    if (results.errors.length === 0) return;
    
    const csvContent = [
      ['Row', 'Field', 'Error Message', 'Data'],
      ...results.errors.map(error => [
        error.row.toString(),
        error.field || '',
        error.message,
        error.data ? JSON.stringify(error.data) : ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `import-errors-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={cn('flex items-center space-x-3', getStatusColor())}>
          {getStatusIcon()}
          <h2 className="text-xl font-semibold">
            {getStatusTitle()}
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {results.totalRows}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Rows
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {results.successCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Imported
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {results.skippedCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Skipped
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {results.errorCount}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Errors
          </div>
        </div>
      </div>

      {/* Success Message */}
      {hasSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              Successfully imported {results.successCount} movie{results.successCount !== 1 ? 's' : ''}.
            </p>
          </div>
        </div>
      )}

      {/* Skipped Movies */}
      {hasSkipped && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                {results.skippedCount} movie{results.skippedCount !== 1 ? 's' : ''} skipped (already exist{results.skippedCount === 1 ? 's' : ''})
              </p>
              {results.skippedMovies.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100">
                    View skipped movie codes
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {results.skippedMovies.map((code, index) => (
                        <div key={index} className="bg-yellow-100 dark:bg-yellow-900/40 rounded px-2 py-1">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {hasErrors && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  {results.errorCount} error{results.errorCount !== 1 ? 's' : ''} occurred during import
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Please review and fix the issues in your CSV file.
                </p>
              </div>
            </div>
            {results.errors.length > 0 && (
              <button
                onClick={exportErrorsToCSV}
                className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-700 rounded-md text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-red-900/20 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Export Errors
              </button>
            )}
          </div>

          {results.errors.length > 0 && (
            <div className="mt-4">
              <div className="max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-red-200 dark:divide-red-800">
                  <thead className="bg-red-100 dark:bg-red-900/40">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Row
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Field
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wider">
                        Error
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-red-200 dark:divide-red-800">
                    {results.errors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-900 dark:text-red-100">
                          {error.row}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-red-900 dark:text-red-100">
                          {error.field || '-'}
                        </td>
                        <td className="px-3 py-2 text-sm text-red-900 dark:text-red-100">
                          {error.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          Import Another File
        </button>
      </div>
    </div>
  );
}
