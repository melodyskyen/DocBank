import type { ManagedFile } from '@/lib/db/schema';
import { Badge } from '../ui/badge';
import {
  ImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileCodeIcon,
  Loader2Icon,
} from 'lucide-react';

interface FileListItemProps {
  file: ManagedFile;
  onClick: () => void;
}

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
            className={`text-sm font-medium ${
              !file.isEmbedded
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-900 dark:text-white'
            } truncate`}
            title={file.name}
          >
            {file.name}
            {!file.isEmbedded && (
              <span className="ml-2 inline-block">
                <Loader2Icon className="inline-block w-3 h-3 animate-spin" />
              </span>
            )}
          </p>
          <p
            className="text-xs text-gray-500 dark:text-gray-400 truncate"
            title={file.aiSummary || 'No summary available'}
          >
            {file.aiSummary ||
              (file.isEmbedded ? 'No summary available' : 'Processing...')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
        <div className="hidden md:block min-w-0">
          {file.tags?.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="mr-1 mb-1 text-xs truncate"
            >
              {tag}
            </Badge>
          ))}
          {file.tags?.length && file.tags.length > 2 && (
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

export default FileListItem;
