'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  FileCode,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Download,
  FolderPlus,
  ChevronRight,
  ArrowLeft,
  Save,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, ConfirmDialog } from '../ui/dialog';
import { formatBytes } from '@/lib/utils';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  updatedAt: string;
  isImportant?: boolean;
}

interface FileManagerProps {
  serverId: string;
}

export function FileManager({ serverId }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // File Editor state
  const [editingFile, setEditingFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [editorSaving, setEditorSaving] = useState(false);

  // Modals
  const [newFolderModal, setNewFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [renameModal, setRenameModal] = useState<{ open: boolean; oldPath: string; newName: string }>({
    open: false,
    oldPath: '',
    newName: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; path: string; name: string }>({
    open: false,
    path: '',
    name: '',
  });

  const loadFiles = async (dirPath: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/files?path=${encodeURIComponent(dirPath)}`);
      const data = await res.json();
      if (res.ok && data.files) {
        setFiles(data.files);
        setCurrentPath(dirPath);
      }
    } catch (err: any) {
      alert(`Failed to load directory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles('');
  }, [serverId]);

  const handleOpenEntry = async (item: FileItem) => {
    if (item.isDirectory) {
      loadFiles(item.path);
    } else {
      // Open text editor
      try {
        const res = await fetch(`/api/servers/${serverId}/files/content?path=${encodeURIComponent(item.path)}`);
        const data = await res.json();
        if (res.ok) {
          setEditingFile({
            path: item.path,
            name: item.name,
            content: data.content || '',
          });
        } else {
          alert(data.error || 'Unable to open file in editor');
        }
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    setEditorSaving(true);
    try {
      const res = await fetch(`/api/servers/${serverId}/files/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: editingFile.path, content: editingFile.content }),
      });
      if (res.ok) {
        alert('File saved successfully!');
        setEditingFile(null);
        loadFiles(currentPath);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save file');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEditorSaving(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    const target = currentPath ? `${currentPath}/${folderName.trim()}` : folderName.trim();
    try {
      const res = await fetch(`/api/servers/${serverId}/files/folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: target }),
      });
      if (res.ok) {
        setNewFolderModal(false);
        setFolderName('');
        loadFiles(currentPath);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create folder');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/servers/${serverId}/files?path=${encodeURIComponent(deleteModal.path)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteModal({ open: false, path: '', name: '' });
        loadFiles(currentPath);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete file');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    loadFiles(parts.join('/'));
  };

  // Breadcrumbs
  const breadcrumbParts = currentPath ? currentPath.split('/') : [];

  const filteredFiles = search
    ? files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : files;

  return (
    <div className="space-y-4">
      {/* File Editor Modal */}
      {editingFile && (
        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold text-white">{editingFile.name}</span>
              <span className="text-xs text-slate-500 font-mono">({editingFile.path})</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingFile(null)}>
                Close
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={handleSaveFile}
                disabled={editorSaving}
                className="gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{editorSaving ? 'Saving...' : 'Save File'}</span>
              </Button>
            </div>
          </div>
          <textarea
            value={editingFile.content}
            onChange={(e) => setEditingFile((prev) => (prev ? { ...prev, content: e.target.value } : null))}
            rows={22}
            className="w-full rounded-lg bg-black/80 border border-slate-800 p-4 font-mono text-xs text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/80 leading-relaxed resize-none"
          />
        </div>
      )}

      {/* Action Toolbar */}
      {!editingFile && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => loadFiles('')}
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              root
            </button>
            {breadcrumbParts.map((part, idx) => {
              const sub = breadcrumbParts.slice(0, idx + 1).join('/');
              return (
                <React.Fragment key={sub}>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                  <button
                    onClick={() => loadFiles(sub)}
                    className="hover:text-white transition-colors"
                  >
                    {part}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentPath && (
              <Button variant="outline" size="sm" onClick={handleGoUp} className="gap-1 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Up
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewFolderModal(true)}
              className="gap-1 text-xs text-emerald-400 border-emerald-500/30"
            >
              <FolderPlus className="h-3.5 w-3.5" /> New Folder
            </Button>
          </div>
        </div>
      )}

      {/* Directory Browser Table */}
      {!editingFile && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Modified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">
                    {loading ? 'Reading server filesystem...' : 'This directory is empty.'}
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.path}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    onClick={() => handleOpenEntry(file)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {file.isDirectory ? (
                          <Folder className="h-4 w-4 text-emerald-400 fill-emerald-400/20" />
                        ) : file.isImportant ? (
                          <FileCode className="h-4 w-4 text-amber-400" />
                        ) : (
                          <FileText className="h-4 w-4 text-slate-400" />
                        )}
                        <span className={`font-medium ${file.isImportant ? 'text-amber-300 font-semibold' : 'text-white'}`}>
                          {file.name}
                        </span>
                        {file.isImportant && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Config
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {file.isDirectory ? '-' : formatBytes(file.sizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {!file.isDirectory && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEntry(file)}
                            className="h-7 px-2 text-slate-400 hover:text-emerald-400"
                            title="Edit file"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal({ open: true, path: file.path, name: file.name })}
                          className="h-7 px-2 text-slate-400 hover:text-red-400"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Folder Modal */}
      <Dialog
        open={newFolderModal}
        onOpenChange={setNewFolderModal}
        title="Create New Folder"
        footer={
          <>
            <Button variant="outline" onClick={() => setNewFolderModal(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleCreateFolder}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-xs text-slate-400 font-medium">Folder Name:</label>
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="e.g. plugins, schematics, scripts..."
            autoFocus
          />
        </div>
      </Dialog>

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, open }))}
        title={`Delete "${deleteModal.name}"?`}
        message="This action permanently deletes this file or directory from the persistent server volume. This cannot be undone."
        confirmLabel="DELETE"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
