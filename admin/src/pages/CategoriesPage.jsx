import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FolderTree, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/categories', {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        image_url: imageUrl,
      });

      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Categories Manager" subtitle="Create and organize category collections." />

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Creation Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-600" /> Add New Category
          </h3>

          <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lounge Wear"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Slug (URL identifier)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lounge-wear"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <ImageUploader
              label="Category Banner (Multer Upload)"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="aspect-square"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Create Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-brand-600" /> Existing Categories
          </h3>

          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" /> Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">No categories found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => (
                <div key={c.id || c.slug} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'}
                      alt={c.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-900">{c.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">/{c.slug}</p>
                      {c.item_count !== undefined && (
                        <p className="text-[10px] text-brand-600 font-semibold mt-0.5">{c.item_count} Items</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id || c.slug)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
