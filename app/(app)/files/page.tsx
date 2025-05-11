'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  FileTextIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
} from 'lucide-react';
import { TAXONOMY } from '@/lib/business/taxonomy';
import type { ManagedFile } from '@/lib/db/schema';
import { FileUploadModal } from '@/components/file-manager/file-upload-modal';
import { fetcher } from '@/lib/utils';
import FileListItem from '@/components/file-manager/file-list-item';

export default function FilesPage() {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch files using SWR
  const {
    data: files,
    error,
    mutate,
  } = useSWR<ManagedFile[]>('/api/files', fetcher);

  const isLoading = !files && !error;

  const paginatedFiles = useMemo(() => {
    if (!files) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return files.slice(startIndex, startIndex + itemsPerPage);
  }, [files, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!files) return 1;
    return Math.ceil(files.length / itemsPerPage);
  }, [files, itemsPerPage]);

  const handleFileClick = (fileId: string) => {
    router.push(`/files/${fileId}`);
  };

  const handleUploadSuccess = useCallback(
    (uploadedFileId: string) => {
      console.log('File uploaded successfully:', uploadedFileId);
      setIsUploadModalOpen(false);
      // Refresh files list
      mutate();
    },
    [mutate],
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">File Manager</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add File
        </Button>
      </div>

      {/* Filters and Sorters Placeholder */}
      <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="filter-taxonomy"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Category
            </label>
            <select
              id="filter-taxonomy"
              className="block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>All Categories</option>
              {TAXONOMY.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="sort-by"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Sort by
            </label>
            <select
              id="sort-by"
              className="block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>Date Uploaded (Newest)</option>
              <option>Date Uploaded (Oldest)</option>
              <option>Name (A-Z)</option>
              <option>Name (Z-A)</option>
              <option>Size (Largest)</option>
              <option>Size (Smallest)</option>
            </select>
          </div>
          <Button variant="outline" className="w-full md:w-auto self-end">
            <FilterIcon className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 flex-grow flex flex-col justify-center items-center">
          <Loader2Icon className="w-12 h-12 mb-4 animate-spin text-gray-400 dark:text-gray-500" />
          <p className="text-xl font-semibold">Loading files...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 dark:text-red-400 mt-10 flex-grow flex flex-col justify-center items-center">
          <p className="text-xl font-semibold">Failed to load files</p>
          <p>Please try again later</p>
        </div>
      ) : files && files.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 flex-grow flex flex-col justify-center items-center">
          <FileTextIcon className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500" />
          <p className="text-xl font-semibold">No files uploaded yet.</p>
          <p>Click "Add File" to get started.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto">
          <ul className="bg-white dark:bg-gray-800/30 shadow overflow-hidden sm:rounded-md">
            {paginatedFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                onClick={() => handleFileClick(file.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Pagination Controls */}
      {files && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeftIcon className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next <ChevronRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
