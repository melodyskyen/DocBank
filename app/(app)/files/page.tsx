'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PlusIcon,
  FileTextIcon,
  FileCodeIcon,
  ImageIcon,
  FileSpreadsheetIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { TAXONOMY } from '@/lib/business/taxonomy';
import type { ManagedFile as DBManagedFile } from '@/lib/db/schema';
import { FileUploadModal } from '@/components/file-manager/file-upload-modal';

// Extended ManagedFile interface for frontend use, matching new schema
interface ManagedFile
  extends Omit<
    DBManagedFile,
    'uploadedAt' | 'tags' | 'userId' | 'blobDownloadUrl'
  > {
  uploadedAt: string; // Keep as ISO string for client-side ease initially
  tags: string[];
  userId: string; // Adding userId to frontend interface for mock data
  blobDownloadUrl?: string | null; // Add this if you plan to store and use it
}

// Mock data - updated to match new schema and needs
const mockFiles: ManagedFile[] = [
  {
    id: '1',
    name: 'Last Will and Testament - John Doe.pdf',
    blobUrl: 'blob:fakeurl/will.pdf',
    blobDownloadUrl: 'blob:fakeurl/will.pdf?download=1',
    mimeType: 'application/pdf',
    size: 1024 * 200,
    aiSummary:
      "A summary of John Doe's last will and testament, outlining beneficiaries and asset distribution.",
    tags: ['Last Will and Testament', 'Funeral / Final Wishes'],
    uploadedAt: new Date('2023-10-15T10:00:00Z').toISOString(),
    userId: 'user-mock-id-123',
    isEmbedded: true,
  },
  {
    id: '2',
    name: 'Investment Policy Statement Q3.docx',
    blobUrl: 'blob:fakeurl/ips.docx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024 * 120,
    aiSummary:
      'Q3 investment policy statement detailing strategy and performance benchmarks.',
    tags: ['Investment Policy Statement (IPS)'],
    uploadedAt: new Date('2023-09-20T14:30:00Z').toISOString(),
    userId: 'user-mock-id-123',
    isEmbedded: true,
  },
  {
    id: '3',
    name: 'Family Trust Agreement.pdf',
    blobUrl: 'blob:fakeurl/trust.pdf',
    mimeType: 'application/pdf',
    size: 1024 * 500,
    aiSummary:
      'Legal document establishing a family trust, its terms, trustees, and beneficiaries.',
    tags: ['Trust Agreements (Revocable / Irrevocable)'],
    uploadedAt: new Date('2023-11-01T09:00:00Z').toISOString(),
    userId: 'user-mock-id-123',
    isEmbedded: true,
  },
  {
    id: '4',
    name: 'Q4 Advisor Meeting Notes.txt',
    blobUrl: 'blob:fakeurl/notes.txt',
    mimeType: 'text/plain',
    size: 1024 * 5,
    aiSummary:
      'Key discussion points and action items from the Q4 advisor meeting.',
    tags: ['Client Feedback / Meeting Minutes', 'Advisor Notes & Commentary'],
    uploadedAt: new Date('2023-12-01T16:00:00Z').toISOString(),
    userId: 'user-mock-id-123',
    isEmbedded: true,
  },
  {
    id: '5',
    name: 'Property Insurance Policy 2024.pdf',
    blobUrl: 'blob:fakeurl/property-insurance.pdf',
    mimeType: 'application/pdf',
    size: 1024 * 350,
    aiSummary:
      'Details of the property and casualty insurance policy for the upcoming year.',
    tags: ['Property & Casualty Insurance'],
    uploadedAt: new Date('2024-01-10T11:00:00Z').toISOString(),
    userId: 'user-mock-id-123',
    isEmbedded: true,
  },
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/'))
    return <ImageIcon className="h-5 w-5 text-gray-500" />;
  if (mimeType === 'application/pdf')
    return <FileTextIcon className="h-5 w-5 text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheetIcon className="h-5 w-5 text-green-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileTextIcon className="h-5 w-5 text-blue-500" />;
  if (mimeType.startsWith('text/'))
    return <FileCodeIcon className="h-5 w-5 text-yellow-500" />;
  return <FileTextIcon className="h-5 w-5 text-gray-500" />;
};

interface FileListItemProps {
  file: ManagedFile;
  onClick: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ file, onClick }) => {
  return (
    <li
      className="flex items-center justify-between p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-150 ease-in-out"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 flex-grow min-w-0">
        {getFileIcon(file.mimeType)}
        <div className="flex-grow min-w-0">
          <p
            className="text-sm font-medium text-gray-900 dark:text-white truncate"
            title={file.name}
          >
            {file.name}
          </p>
          <p
            className="text-xs text-gray-500 dark:text-gray-400 truncate"
            title={file.aiSummary || 'No summary available'}
          >
            {file.aiSummary || 'No summary available'}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
        <div className="hidden md:block min-w-0">
          {file.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="mr-1 mb-1 text-xs truncate"
            >
              {tag}
            </Badge>
          ))}
          {file.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{file.tags.length - 2}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 w-20 text-right hidden sm:block">
          {(file.size / 1024).toFixed(1)} KB
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right hidden lg:block">
          {new Date(file.uploadedAt).toLocaleDateString()}
        </p>
        {file.blobDownloadUrl && (
          <a
            href={file.blobDownloadUrl}
            download
            onClick={(e) => e.stopPropagation()}
            className="text-xs p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Download file"
          >
            ⬇️
          </a>
        )}
      </div>
    </li>
  );
};

export default function FilesPage() {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // TODO: Replace with actual API call, filtering, sorting, and pagination logic
  // For now, just a way to force a re-render if we add a mock file or similar
  const [dataVersion, setDataVersion] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const files = useMemo(
    () =>
      mockFiles.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      ),
    [dataVersion],
  ); // Re-memoize if dataVersion changes

  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return files.slice(startIndex, startIndex + itemsPerPage);
  }, [files, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(files.length / itemsPerPage);

  const handleFileClick = (fileId: string) => {
    router.push(`/files/${fileId}`);
  };

  const handleUploadSuccess = useCallback((uploadedFileId: string) => {
    console.log('File uploaded successfully:', uploadedFileId);
    setIsUploadModalOpen(false);
    setDataVersion((prev) => prev + 1);
  }, []);

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

      {files.length === 0 ? (
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

      {/* Pagination Controls Placeholder */}
      {totalPages > 1 && (
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
