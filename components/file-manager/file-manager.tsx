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
  XIcon,
  CheckIcon,
  ChevronsUpDownIcon,
} from 'lucide-react';
import type { DBManagedFileType } from '@/lib/db/schema';
import { FileUploadModal } from '@/components/file-manager/file-upload-modal';
import { fetcher, cn } from '@/lib/utils';
import FileListItem from '@/components/file-manager/file-list-item';
import type { Realtime } from '@inngest/realtime';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

interface MultiSelectTagsProps {
  allTags: string[] | undefined;
  selectedTags: string[];
  onChange: (selected: string[]) => void;
  isLoading?: boolean;
  hasError?: boolean;
  placeholder?: string;
  className?: string;
}

const MultiSelectTags: React.FC<MultiSelectTagsProps> = ({
  allTags = [],
  selectedTags,
  onChange,
  isLoading,
  hasError,
  placeholder = 'Select tags...',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelect = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange(newSelectedTags);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const filteredTags = allTags.filter((tag) =>
    tag.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const triggerText = () => {
    if (isLoading) return 'Loading tags...';
    if (hasError) return 'Error loading tags';
    if (selectedTags.length === 0) return placeholder;
    return null; // Badges will be shown
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-start text-left font-normal h-10 px-3 py-2 text-sm',
            'border border-gray-300 dark:border-gray-600 rounded-md shadow-sm',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
            'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            !selectedTags.length && 'text-gray-500 dark:text-gray-400',
            className,
          )}
          disabled={isLoading || hasError}
          onClick={() => setOpen(!open)}
        >
          <div className="flex items-center w-full">
            <ChevronsUpDownIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <div className="flex flex-wrap gap-1 items-center flex-grow">
              {selectedTags.length > 0
                ? selectedTags.map((tag) => (
                    <Badge
                      variant="secondary"
                      key={tag}
                      className="mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag);
                      }}
                    >
                      {tag}
                      <XIcon className="ml-1 h-3 w-3 cursor-pointer" />
                    </Badge>
                  ))
                : triggerText() && (
                    <span className="truncate">{triggerText()}</span>
                  )}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search tags..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? 'Loading...'
                : hasError
                  ? 'Error fetching tags'
                  : 'No tags found.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredTags.map((tag) => (
                <CommandItem
                  key={tag}
                  value={tag}
                  onSelect={() => {
                    handleSelect(tag);
                    // Optionally keep popover open: setOpen(true);
                  }}
                >
                  <CheckIcon
                    className={`mr-2 h-4 w-4 ${
                      selectedTags.includes(tag) ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
            {selectedTags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])} // Clear all
                    className="justify-center text-center text-sm text-muted-foreground cursor-pointer"
                  >
                    Clear selected tags
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface FileManagerProps {
  token: Realtime.Subscribe.Token;
}

export default function FileManager({ token }: FileManagerProps) {
  const router = useRouter();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for dropdown selections
  const [currentSelectedTags, setCurrentSelectedTags] = useState<string[]>([]);
  const [currentSortBy, setCurrentSortBy] = useState('Date Uploaded (Newest)');

  // State for applied filters
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [appliedSortBy, setAppliedSortBy] = useState('Date Uploaded (Newest)');

  // Fetch files using SWR
  const {
    data: files,
    error: filesError,
    mutate: mutateFiles,
  } = useSWR<DBManagedFileType[]>('/api/files', fetcher);

  // Fetch tags using SWR
  const { data: tagsData, error: tagsError } = useSWR<string[]>(
    '/api/tags',
    fetcher,
  );

  const isLoadingFiles = !files && !filesError;
  const isLoadingTags = !tagsData && !tagsError;
  const isLoading = isLoadingFiles || isLoadingTags;

  const filteredAndSortedFiles = useMemo(() => {
    if (!files) return [];
    let processedFiles = [...files];

    // Apply tag filter
    if (appliedTags.length > 0) {
      processedFiles = processedFiles.filter(
        (file) =>
          file.tags && appliedTags.some((tag) => file.tags?.includes(tag)),
      );
    }

    // Apply sorting
    // Assuming file has: name: string, uploadedAt: Date, size: number
    switch (appliedSortBy) {
      case 'Date Uploaded (Newest)':
        processedFiles.sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );
        break;
      case 'Date Uploaded (Oldest)':
        processedFiles.sort(
          (a, b) =>
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
        );
        break;
      case 'Name (A-Z)':
        processedFiles.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name (Z-A)':
        processedFiles.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'Size (Largest)':
        processedFiles.sort((a, b) => b.size - a.size);
        break;
      case 'Size (Smallest)':
        processedFiles.sort((a, b) => a.size - b.size);
        break;
      default:
        break;
    }

    return processedFiles;
  }, [files, appliedTags, appliedSortBy]);

  const paginatedFiles = useMemo(() => {
    if (!filteredAndSortedFiles) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedFiles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedFiles, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    if (!filteredAndSortedFiles) return 1;
    return Math.ceil(filteredAndSortedFiles.length / itemsPerPage);
  }, [filteredAndSortedFiles, itemsPerPage]);

  const handleFileClick = (fileId: string) => {
    router.push(`/files/${fileId}`);
  };

  const handleUploadSuccess = useCallback(
    (uploadedFileId: string) => {
      console.log('File uploaded successfully:', uploadedFileId);
      setIsUploadModalOpen(false);
      // Refresh files list
      mutateFiles();
    },
    [mutateFiles],
  );

  const handleDeleteFile = useCallback(
    async (fileId: string) => {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        body: JSON.stringify({ id: fileId }),
      });
      const deletedFile = await response.json();
      console.log('Deleted file:', deletedFile);

      if (deletedFile) {
        // Refresh the files list
        mutateFiles();
      } else {
        console.error('Error deleting file');
      }
    },
    [mutateFiles],
  );

  const handleApplyFilters = () => {
    setAppliedTags(currentSelectedTags);
    setAppliedSortBy(currentSortBy);
    setCurrentPage(1); // Reset to first page when filters change
  };

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
              Filter by Tags
            </label>

            <MultiSelectTags
              allTags={tagsData}
              selectedTags={currentSelectedTags}
              onChange={setCurrentSelectedTags}
              isLoading={isLoadingTags}
              hasError={!!tagsError}
              placeholder="Select tags to filter..."
            />
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
              value={currentSortBy}
              onChange={(e) => setCurrentSortBy(e.target.value)}
            >
              <option>Date Uploaded (Newest)</option>
              <option>Date Uploaded (Oldest)</option>
              <option>Name (A-Z)</option>
              <option>Name (Z-A)</option>
              <option>Size (Largest)</option>
              <option>Size (Smallest)</option>
            </select>
          </div>
          <Button
            variant="outline"
            className="w-full md:w-auto self-end"
            onClick={handleApplyFilters}
            disabled={isLoadingFiles}
          >
            <FilterIcon className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10 flex-grow flex flex-col justify-center items-center">
          <Loader2Icon className="w-12 h-12 mb-4 animate-spin text-gray-400 dark:text-gray-500" />
          <p className="text-xl font-semibold">Loading files...</p>
        </div>
      ) : filesError ? (
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
                token={token}
                file={file}
                onClick={() => handleFileClick(file.id)}
                onDelete={handleDeleteFile}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredAndSortedFiles && totalPages > 1 && (
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
