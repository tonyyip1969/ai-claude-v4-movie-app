'use client';

import { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { Tag } from '@/lib/database';

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [editingTag, setEditingTag] = useState<{ id: number; name: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            if (!response.ok) throw new Error('Failed to fetch tags');
            const data = await response.json();
            setTags(data);
        } catch (err) {
            setError('Failed to load tags');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTag = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const trimmedName = newTagName.trim();
        if (!trimmedName) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create tag');
            }

            const newTag = await response.json();
            setTags([...tags, newTag].sort((a, b) => a.name.localeCompare(b.name)));
            setNewTagName('');
            setSuccess('Tag created successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTag) return;
        setError(null);
        setSuccess(null);

        const trimmedName = editingTag.name.trim();
        if (!trimmedName) return;

        try {
            const response = await fetch('/api/tags', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingTag.id, name: trimmedName }),
            });

            if (!response.ok) throw new Error('Failed to update tag');

            setTags(tags.map(t => t.id === editingTag.id ? { ...t, name: trimmedName } : t).sort((a, b) => a.name.localeCompare(b.name)));
            setEditingTag(null);
            setSuccess('Tag updated successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to update tag');
            console.error(err);
        }
    };

    const handleDeleteTag = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) return;
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch(`/api/tags?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete tag');

            setTags(tags.filter(t => t.id !== id));
            setSuccess('Tag deleted successfully');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete tag');
            console.error(err);
        }
    };

    const filteredTags = tags.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 p-6">
            {/* Header Section */}
            <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                        <TagIcon className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white">
                        Tag{' '}
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Management
                        </span>
                    </h1>
                </div>

                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Create, edit, and organize tags for your movie collection.
                </p>
            </div>

            {/* Notifications */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-center max-w-2xl mx-auto">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-center max-w-2xl mx-auto">
                    {success}
                </div>
            )}

            {/* Create and Search Tag Section */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Create Tag */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Create New Tag</h2>
                    <form onSubmit={handleCreateTag} className="flex gap-2">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Enter tag name..."
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={!newTagName.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add</span>
                        </button>
                    </form>
                </div>

                {/* Search Tags */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Search Tags</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tags..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tags List */}
            <div className="max-w-4xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">All Tags ({tags.length})</h2>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading tags...</p>
                    </div>
                ) : filteredTags.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <TagIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No tags found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredTags.map((tag) => (
                            <div key={tag.id} className="bg-gray-900 border border-gray-700 rounded-lg p-3 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                                {editingTag?.id === tag.id ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <input
                                            type="text"
                                            value={editingTag.name}
                                            onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                                            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500"
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateTag} className="text-green-400 hover:text-green-300 p-1">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingTag(null)} className="text-gray-400 hover:text-gray-300 p-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="truncate text-white font-medium">{tag.name}</span>
                                            {tag.count !== undefined && (
                                                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                                                    {tag.count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingTag({ id: tag.id, name: tag.name })}
                                                className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                                                title="Rename"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTag(tag.id)}
                                                className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
