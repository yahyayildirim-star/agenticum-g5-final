import type { VaultFile } from '../lib/types';
import { Upload, Download, Trash2, FileText, Image, Video, Music, Database, FolderOpen } from 'lucide-react';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileVaultProps {
  files: VaultFile[];
  onUpload: (files: FileList) => void;
  onDownload: (file: VaultFile) => void;
  onDelete: (fileId: string) => void;
}

export function FileVault({ files, onUpload, onDownload, onDelete }: FileVaultProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const getIcon = (type: VaultFile['type']) => {
    switch (type) {
      case 'image': return <Image size={16} className="text-pink-400" />;
      case 'video': return <Video size={16} className="text-purple-400" />;
      case 'audio': return <Music size={16} className="text-green-400" />;
      case 'data': return <Database size={16} className="text-orange-400" />;
      default: return <FileText size={16} className="text-cyan-400" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Upload Area */}
      <div 
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-700 hover:border-cyan-500/50 rounded-lg p-6 mb-4 cursor-pointer transition-all hover:bg-cyan-500/5 group"
      >
        <input 
          ref={inputRef}
          type="file" 
          multiple 
          className="hidden" 
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-cyan-400 transition-colors">
          <Upload size={24} />
          <span className="text-xs font-mono">Drop files or click to upload</span>
          <span className="text-[10px] text-gray-600">PDF, Images, Videos, Documents</span>
        </div>
      </div>

      {/* File List */}
      {files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
          <FolderOpen size={32} className="mb-2 opacity-50" />
          <span className="text-xs font-mono">Vault is empty</span>
          <span className="text-[10px] mt-1">Generated assets will appear here</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-900/50 border border-gray-800 hover:border-gray-700 rounded-lg p-3 group transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                    {getIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-gray-200 truncate">{file.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.source}</span>
                      <span>•</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onDownload(file)}
                      className="p-1.5 hover:bg-cyan-500/20 rounded text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete(file.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-[10px] font-mono text-gray-500">
        <span>{files.length} files</span>
        <span>{formatSize(files.reduce((acc, f) => acc + f.size, 0))} total</span>
      </div>
    </div>
  );
}
