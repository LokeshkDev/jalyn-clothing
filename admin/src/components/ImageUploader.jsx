import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ImageUploader({
  value,
  onChange,
  label = 'Upload Image',
  fieldKey = 'banner_image',
  aspectRatio = 'aspect-video',
  recommendedSize = '1920 × 800 px (Recommended)',
  placeholderText = 'Upload high resolution image',
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageMeta, setImageMeta] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.file?.url) {
        onChange(response.data.file.url);
        if (response.data.file.width && response.data.file.height) {
          setImageMeta({
            width: response.data.file.width,
            height: response.data.file.height,
            size: response.data.file.size,
          });
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload image. Server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setImageMeta(null);
    setError('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 max-w-md">
        {label && <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">{label}</label>}
        {recommendedSize && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FAF0E6] text-[#C28E5C] border border-[#EFE8E2]">
            {recommendedSize}
          </span>
        )}
      </div>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm max-w-md">
          <img
            src={value}
            alt="Preview"
            className={`w-full h-44 object-cover ${aspectRatio}`}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded-md">
              {recommendedSize}
            </span>
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer bg-white text-gray-900 text-xs font-semibold px-3.5 py-2 rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-brand-600" />
              Replace Image
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            </div>
          )}
        </div>
      ) : (
        <label className="border-2 border-dashed border-gray-300 hover:border-brand-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-brand-50/20 transition group max-w-md">
          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform mb-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {loading ? 'Uploading via Server...' : placeholderText}
          </span>
          <span className="inline-block text-[11px] font-mono text-[#C28E5C] bg-[#FAF0E6] px-2 py-0.5 rounded mt-1.5">
            Size placeholder: {recommendedSize}
          </span>
          <span className="text-[10px] text-gray-400 mt-1">Formats: PNG, JPG, WEBP (Max 5MB)</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={loading} />
        </label>
      )}

      {/* Status Messages */}
      {success && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Image uploaded successfully & reflects on website!
        </div>
      )}
      {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
    </div>
  );
}
