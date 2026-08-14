import React, { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, FolderTree, Loader2, Edit2, X, Search, Check, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Editing vs Create State
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toast alert system
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.allSettled([
        api.get('/categories'),
        api.get('/products'),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.categories) {
        setCategories(catRes.value.data.categories);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.data?.products) {
        setProducts(prodRes.value.data.products);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductCount = (category) => {
    if (products && products.length > 0) {
      const cSlug = (category.slug || '').toLowerCase().trim();
      const cName = (category.name || '').toLowerCase().trim();
      const matching = products.filter((p) => {
        const pCat = (p.category || '').toLowerCase().trim();
        const pSlug = (p.category_slug || '').toLowerCase().trim();
        return (
          (pSlug && pSlug === cSlug) ||
          (pCat && pCat === cSlug) ||
          (pCat && pCat === cName) ||
          (pCat && pCat.replace(/[^a-z0-9]+/g, '-') === cSlug)
        );
      });
      return matching.length;
    }
    return Number(category.item_count) || 0;
  };

  const handleSelectEdit = (category) => {
    setEditingId(category.id || category.slug);
    setName(category.name || '');
    setSlug(category.slug || '');
    setDescription(category.description || '');
    setImageUrl(category.image_url || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payloadSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, {
          name,
          slug: payloadSlug,
          description,
          image_url: imageUrl,
        });
        showToast(`Category "${name}" updated successfully!`);
      } else {
        await api.post('/categories', {
          name,
          slug: payloadSlug,
          description,
          image_url: imageUrl,
        });
        showToast(`Category "${name}" created successfully!`);
      }

      handleCancelEdit();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || (editingId ? 'Failed to update category' : 'Failed to create category'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast(`Category "${catName}" deleted successfully.`);
      if (editingId === id) {
        handleCancelEdit();
      }
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Categories Manager"
        subtitle="Create, edit, organize and manage category collections that dynamically link across the storefront."
      />

      {/* Toast Alert popup */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Form (Create / Edit) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4 h-fit sticky top-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-heading text-base font-bold text-gray-900 flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit2 className="w-4 h-4 text-brand-600" />
                  <span>Edit Category</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-brand-600" />
                  <span>Add New Category</span>
                </>
              )}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                title="Cancel editing and create new category"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lounge Wear"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Slug (URL identifier)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lounge-wear"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono text-gray-700 transition text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description highlighting this category's apparel style..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition text-xs"
              />
            </div>

            <ImageUploader
              label="CATEGORY BANNER (MULTER UPLOAD)"
              value={imageUrl}
              onChange={setImageUrl}
              aspectRatio="aspect-[16/9]"
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Category' : 'Create Category'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Existing Categories List (Small Cards) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-brand-600" /> Existing Categories
              </h3>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-2" /> Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs space-y-2">
              <p>No categories found matching "{search}".</p>
              <button
                onClick={() => setSearch('')}
                className="text-brand-600 font-semibold underline text-xs cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCategories.map((c) => {
                const isSelected = editingId === (c.id || c.slug);
                return (
                  <div
                    key={c.id || c.slug}
                    onClick={() => handleSelectEdit(c)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-gray-200/80 bg-gray-50/70 hover:bg-white hover:border-brand-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'}
                        alt={c.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-gray-900 truncate">
                            {c.name}
                          </p>
                          {isSelected && (
                            <span className="text-[9px] bg-brand-600 text-white px-1.5 py-0.2 rounded font-semibold uppercase">
                              Editing
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono truncate">/{c.slug}</p>
                        <p className="text-[10px] text-brand-600 font-semibold mt-0.5">{getProductCount(c)} Items</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleSelectEdit(c)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'text-gray-400 hover:text-brand-600 hover:bg-white border border-transparent hover:border-gray-200'
                        }`}
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(c.id || c.slug, c.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
