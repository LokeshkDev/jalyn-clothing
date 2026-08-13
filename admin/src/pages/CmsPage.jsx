import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Megaphone,
  LayoutGrid,
  Tag,
  Instagram,
  Navigation,
  Columns,
  Plus,
  Trash2,
  Edit2,
  Heart,
  Truck,
  RefreshCw,
  Eye,
  Film,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Phone,
} from 'lucide-react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';

export default function CmsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [cmsData, setCmsData] = useState({
    announcement_bar: {
      enabled: true,
      text: '✨ FREE SHIPPING ON ORDERS OVER ₹1999 | USE CODE JALYN10 FOR 10% OFF ✨',
      link: '/shop',
      bg_color: '#FFF6F9',
      text_color: '#4A2F3C',
    },
    hero_banner: {
      heading: 'Style Meets Comfort',
      subheading: 'Elevate your everyday wardrobe with our luxury silhouettes.',
      cta_text: 'Explore Collection',
      cta_link: '/shop',
      banner_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      slides: [
        {
          id: 1,
          eyebrow: 'New Collection',
          title: 'Style Meets',
          highlight: 'Comfort',
          subtitle: 'Elevate your everyday wardrobe with our luxury silhouettes.',
          image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
          cta: 'Explore Collection',
          href: '/shop',
        },
      ],
    },
    category_grid: {
      title: 'Curated for Every You',
      subtitle: 'Browse handpicked styles for every mood',
      categories: [
        { id: 'dresses', title: 'Dresses & Gowns', subtitle: '28+ Items', slug: 'dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
        { id: 'ethnic', title: 'Ethnic Wear', subtitle: '22+ Items', slug: 'ethnic', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
      ],
    },
    why_jalyn: {
      title: 'Fashion That Feels Like You',
      values: [
        { title: 'Designed for Comfort', description: 'Soft, breathable & skin friendly fabrics' },
        { title: 'Made for Every Woman', description: 'Styles that celebrate every body type' },
        { title: 'Sustainable Choices', description: 'Conscious fashion for a better tomorrow' },
        { title: 'Loved by Thousands', description: 'Join our growing community of women' },
      ],
    },
    services_strip: {
      promises: [
        { icon: 'truck', title: 'Free Shipping', description: 'On all orders above ₹1999' },
        { icon: 'refresh', title: 'Easy 7-Day Returns', description: 'Hassle-free return policy' },
        { icon: 'shield', title: 'Secure Payments', description: '100% encrypted & safe' },
        { icon: 'sparkles', title: 'Premium Quality', description: 'Thoughtfully crafted fabrics' },
      ],
    },
    promo_banner: {
      badge: 'LIMITED TIME OFFER',
      title: 'Unveil Your Chic Signature Style',
      subtitle: 'Get up to 40% Off on our exclusive Festive Collection',
      cta_text: 'Shop Sale Now',
      cta_link: '/shop',
      bg_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    },
    instagram_feed: {
      handle: '@jalyn.apparels',
      url: 'https://www.instagram.com/jalyn.apparels/',
      posts: [
        { id: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
        { id: 2, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
        { id: 3, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
      ],
    },
    menu_arrangement: {
      nav_links: [
        { label: 'New Arrivals', href: '/collections/new-arrivals' },
        { label: 'Clothing', href: '/shop' },
        { label: 'Categories', href: '/shop' },
        { label: 'Shop All', href: '/shop' },
        { label: 'Sale', href: '/collections/sale' },
      ],
    },
    footer_settings: {
      about_text: 'Effortless style. Everyday comfort. Premium women’s fashion designed to feel as good as it looks.',
      instagram_link: 'https://www.instagram.com/jalyn.apparels/',
      facebook_link: 'https://www.instagram.com/jalyn.apparels/',
      twitter_link: 'https://www.instagram.com/jalyn.apparels/',
      youtube_link: 'https://www.instagram.com/jalyn.apparels/',
      columns: [
        {
          title: 'Customer Care',
          links: [
            { label: 'Contact Us', href: '/contact' },
            { label: 'Shipping & Delivery', href: '/shipping-delivery' },
            { label: 'Returns & Exchanges', href: '/returns-exchanges' },
            { label: 'Track Order', href: '/track-order' },
            { label: 'Size Guide', href: '/size-guide' },
          ],
        },
        {
          title: 'About Jalyn',
          links: [
            { label: 'Our Story', href: '/about' },
            { label: 'Craftsmanship', href: '/craftsmanship' },
            { label: 'Sustainability', href: '/sustainability' },
            { label: 'Press & Media', href: '/press-media' },
            { label: 'Careers', href: '/careers' },
          ],
        },
        {
          title: 'Policies & Legal',
          links: [
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms of Service', href: '/terms-of-service' },
            { label: 'Refund Policy', href: '/refund-policy' },
          ],
        },
      ],
    },
    about_page: {
      hero_title: 'Crafting Elegance, Celebrating You',
      hero_subtitle: 'Discover the story behind Jalyn Apparels — where traditional artistry meets contemporary silhouette design.',
      hero_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
      story_heading: 'Our Story & Heritage',
      story_content: "Founded with a passion for effortless style and everyday comfort, JALYN creates premium women's fashion that celebrates individuality and grace. Each collection is meticulously designed with breathable luxury fabrics, hand-embroidered details, and tailored fits that feel like a second skin.",
      craftsmanship_title: 'Artisanal Craftsmanship',
      craftsmanship_content: 'Every dress, kurti, and co-ord set is brought to life by master artisans who preserve centuries-old embroidery techniques. We take pride in small-batch production that prioritizes quality over quantity.',
      craftsmanship_image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=1000',
      sustainability_title: 'Conscious & Sustainable',
      sustainability_content: 'We use eco-friendly dyes, organic cotton blends, and zero-waste fabric cutting practices to minimize environmental impact while keeping fashion luxurious.',
      sustainability_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=1000',
      stats: [
        { number: '50,000+', label: 'Happy Women' },
        { number: '100%', label: 'Ethical & Artisanal' },
        { number: '15+', label: 'Master Craftsmen' },
        { number: '4.9★', label: 'Average Rating' },
      ],
    },
    contact_page: {
      hero_title: 'We’d Love to Hear From You',
      hero_subtitle: 'Have a question about your order, sizing, or custom styling advice? Our customer care team is here for you.',
      hero_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=80',
      email: 'support@jalyn.in',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      address: 'Jalyn Fashion Studio, 42 Luxury Boulevard, Fashion District, Mumbai, MH 400001, India',
      working_hours: 'Monday - Saturday: 10:00 AM - 7:00 PM IST',
      google_maps_url: 'https://maps.google.com/maps?q=Mumbai,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed',
    },
  });

  const [activeTab, setActiveTab] = useState('announcement_bar');

  useEffect(() => {
    async function fetchCmsData() {
      try {
        const response = await api.get('/cms/homepage');
        if (response.data?.data) {
          setCmsData((prev) => ({ ...prev, ...response.data.data }));
        }
      } catch (err) {
        console.warn('Failed to load CMS data from API, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCmsData();
  }, []);

  const handleSaveSection = async (sectionKey) => {
    setSavingSection(sectionKey);
    setMessage({ type: '', text: '' });

    try {
      const sectionPayload = cmsData[sectionKey];
      await api.put(`/cms/homepage/${sectionKey}`, sectionPayload);

      setMessage({ type: 'success', text: `Section '${sectionKey}' saved to DB & live client successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Failed to save section:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save section to backend server.',
      });
    } finally {
      setSavingSection('');
    }
  };

  const updateSectionField = (sectionKey, field, value) => {
    setCmsData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'announcement_bar', label: 'Announcement Bar', icon: Megaphone },
    { id: 'hero_banner', label: 'Hero Slides', icon: ImageIcon },
    { id: 'category_grid', label: 'Curated Categories', icon: LayoutGrid },
    { id: 'about_page', label: 'About Page', icon: Sparkles },
    { id: 'contact_page', label: 'Contact Page', icon: Phone },
    { id: 'why_jalyn', label: 'Why Jalyn Values', icon: Heart },
    { id: 'services_strip', label: 'Services Promises', icon: Truck },
    { id: 'promo_banner', label: 'Promo Banner', icon: Tag },
    { id: 'instagram_feed', label: 'Instagram Posts', icon: Instagram },
    { id: 'menu_arrangement', label: 'Header Menu', icon: Navigation },
    { id: 'footer_settings', label: 'Footer Columns', icon: Columns },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Homepage CMS & Layout Manager"
        subtitle="Full CRUD control over every section, banner, menu link, and footer column across your store."
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Notification Toast */}
        {message.text && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. Announcement Bar Tab */}
        {activeTab === 'announcement_bar' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand-600" /> Top Announcement Bar
              </h3>
              <button
                onClick={() => handleSaveSection('announcement_bar')}
                disabled={savingSection === 'announcement_bar'}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {savingSection === 'announcement_bar' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Section</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ann_enabled"
                  checked={cmsData.announcement_bar.enabled}
                  onChange={(e) => updateSectionField('announcement_bar', 'enabled', e.target.checked)}
                  className="h-4 w-4 text-brand-600 rounded"
                />
                <label htmlFor="ann_enabled" className="font-bold text-gray-800">
                  Enable Announcement Bar Header
                </label>
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-gray-700 mb-1">Announcement Text</label>
                <input
                  type="text"
                  value={cmsData.announcement_bar.text}
                  onChange={(e) => updateSectionField('announcement_bar', 'text', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Link</label>
                <input
                  type="text"
                  value={cmsData.announcement_bar.link}
                  onChange={(e) => updateSectionField('announcement_bar', 'link', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cmsData.announcement_bar.bg_color || '#FFF6F9'}
                    onChange={(e) => updateSectionField('announcement_bar', 'bg_color', e.target.value)}
                    className="h-9 w-12 rounded border p-1"
                  />
                  <input
                    type="text"
                    value={cmsData.announcement_bar.bg_color || '#FFF6F9'}
                    onChange={(e) => updateSectionField('announcement_bar', 'bg_color', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Hero Banner & Slides Tab (CRUD) */}
        {activeTab === 'hero_banner' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-600" /> Hero Banner &amp; Slides
                </h3>
                <p className="text-[11px] text-gray-500">Create, edit, reorder, or delete hero carousel slides with Multer image upload.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextSlides = [
                      ...(cmsData.hero_banner.slides || []),
                      {
                        id: Date.now(),
                        eyebrow: 'New Collection',
                        title: 'Fresh Style',
                        highlight: 'Arrivals',
                        subtitle: 'Explore our latest luxury designs crafted for effortless grace.',
                        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
                        cta: 'Shop Now',
                        href: '/shop',
                      },
                    ];
                    updateSectionField('hero_banner', 'slides', nextSlides);
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Slide
                </button>

                <button
                  onClick={() => handleSaveSection('hero_banner')}
                  disabled={savingSection === 'hero_banner'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'hero_banner' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Slides</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {cmsData.hero_banner?.slides?.map((slide, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold text-gray-900 text-sm">Slide #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = cmsData.hero_banner.slides.filter((_, i) => i !== idx);
                        updateSectionField('hero_banner', 'slides', next);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition flex items-center gap-1 text-xs font-semibold"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" /> Delete Slide
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Eyebrow Badge</label>
                      <input
                        type="text"
                        value={slide.eyebrow}
                        onChange={(e) => {
                          const next = [...cmsData.hero_banner.slides];
                          next[idx].eyebrow = e.target.value;
                          updateSectionField('hero_banner', 'slides', next);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Title Main</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const next = [...cmsData.hero_banner.slides];
                          next[idx].title = e.target.value;
                          updateSectionField('hero_banner', 'slides', next);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Highlighted Words</label>
                      <input
                        type="text"
                        value={slide.highlight}
                        onChange={(e) => {
                          const next = [...cmsData.hero_banner.slides];
                          next[idx].highlight = e.target.value;
                          updateSectionField('hero_banner', 'slides', next);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold text-brand-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">CTA Button Text &amp; Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={slide.cta}
                          onChange={(e) => {
                            const next = [...cmsData.hero_banner.slides];
                            next[idx].cta = e.target.value;
                            updateSectionField('hero_banner', 'slides', next);
                          }}
                          placeholder="CTA Text"
                          className="w-1/2 px-2.5 py-1.5 rounded-xl border border-gray-300 font-semibold"
                        />
                        <input
                          type="text"
                          value={slide.href}
                          onChange={(e) => {
                            const next = [...cmsData.hero_banner.slides];
                            next[idx].href = e.target.value;
                            updateSectionField('hero_banner', 'slides', next);
                          }}
                          placeholder="/link"
                          className="w-1/2 px-2.5 py-1.5 rounded-xl border border-gray-300 font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={slide.subtitle}
                      onChange={(e) => {
                        const next = [...cmsData.hero_banner.slides];
                        next[idx].subtitle = e.target.value;
                        updateSectionField('hero_banner', 'slides', next);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>

                  <ImageUploader
                    label="Slide Banner Image (Multer Upload)"
                    value={slide.image}
                    onChange={(url) => {
                      const next = [...cmsData.hero_banner.slides];
                      next[idx].image = url;
                      updateSectionField('hero_banner', 'slides', next);
                    }}
                    aspectRatio="aspect-[16/6]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Curated Categories Tab (CRUD) */}
        {activeTab === 'category_grid' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-brand-600" /> Curated Categories</h3>
                <p className="text-[11px] text-gray-500">Add, edit, delete categories, upload images, or sync directly from product database catalog.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.get('/categories');
                      if (res.data?.categories?.length) {
                        const syncedCats = res.data.categories
                          .filter((c) => c.slug !== 'all')
                          .map((c) => ({
                            id: c.id || c.slug,
                            title: c.name || c.title,
                            slug: c.slug,
                            subtitle: `${c.item_count || 15}+ Items`,
                            image: c.image_url || c.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
                          }));
                        updateSectionField('category_grid', 'categories', syncedCats);
                        setMessage({ type: 'success', text: `Synced ${syncedCats.length} categories from Database Catalog!` });
                        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
                      }
                    } catch (err) {
                      alert('Failed to fetch catalog categories: ' + err.message);
                    }
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Catalog Categories
                </button>

                <button
                  onClick={() => handleSaveSection('category_grid')}
                  disabled={savingSection === 'category_grid'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'category_grid' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Section</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={cmsData.category_grid?.title || ''}
                    onChange={(e) => updateSectionField('category_grid', 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Section Subtitle</label>
                  <input
                    type="text"
                    value={cmsData.category_grid?.subtitle || ''}
                    onChange={(e) => updateSectionField('category_grid', 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="font-bold text-gray-900 text-sm">
                  Active Homepage Category Cards ({cmsData.category_grid?.categories?.length || 0})
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const next = [
                      ...(cmsData.category_grid?.categories || []),
                      {
                        id: `cat-${Date.now()}`,
                        title: 'New Category',
                        slug: 'new-category',
                        subtitle: '15+ Items',
                        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
                      },
                    ];
                    updateSectionField('category_grid', 'categories', next);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Category Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cmsData.category_grid?.categories?.map((cat, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/90 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={cat.image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'}
                        alt={cat.title}
                        className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0 bg-white"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={cat.title}
                            onChange={(e) => {
                              const next = [...cmsData.category_grid.categories];
                              next[idx].title = e.target.value;
                              updateSectionField('category_grid', 'categories', next);
                            }}
                            placeholder="Category Title"
                            className="font-bold text-sm text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-300 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = cmsData.category_grid.categories.filter((_, i) => i !== idx);
                              updateSectionField('category_grid', 'categories', next);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition ml-2 cursor-pointer"
                            title="Delete category card"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={cat.slug}
                            onChange={(e) => {
                              const next = [...cmsData.category_grid.categories];
                              next[idx].slug = e.target.value;
                              updateSectionField('category_grid', 'categories', next);
                            }}
                            placeholder="slug"
                            className="px-2 py-1 rounded-lg border border-gray-200 bg-white font-mono text-[11px] text-gray-600"
                          />
                          <input
                            type="text"
                            value={cat.subtitle || ''}
                            onChange={(e) => {
                              const next = [...cmsData.category_grid.categories];
                              next[idx].subtitle = e.target.value;
                              updateSectionField('category_grid', 'categories', next);
                            }}
                            placeholder="Subtitle (e.g. 20+ Items)"
                            className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-[11px]"
                          />
                        </div>
                      </div>
                    </div>

                    <ImageUploader
                      label="Category Banner Image (Multer Upload)"
                      value={cat.image}
                      onChange={(url) => {
                        const next = [...cmsData.category_grid.categories];
                        next[idx].image = url;
                        updateSectionField('category_grid', 'categories', next);
                      }}
                      aspectRatio="aspect-[16/9]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. About Page CMS Tab */}
        {activeTab === 'about_page' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" /> About Page Content Management
                </h3>
                <p className="text-xs text-gray-500">Manage hero banner, brand story, craftsmanship, sustainability, and statistics displayed on /about.</p>
              </div>
              <button
                onClick={() => handleSaveSection('about_page')}
                disabled={savingSection === 'about_page'}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {savingSection === 'about_page' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save About Page</span>
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Hero Banner Section */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-sm text-gray-900">Hero Section</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Hero Main Title</label>
                    <input
                      type="text"
                      value={cmsData.about_page?.hero_title || ''}
                      onChange={(e) => updateSectionField('about_page', 'hero_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Hero Subtitle</label>
                    <input
                      type="text"
                      value={cmsData.about_page?.hero_subtitle || ''}
                      onChange={(e) => updateSectionField('about_page', 'hero_subtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                </div>
                <ImageUploader
                  label="About Hero Background Image"
                  value={cmsData.about_page?.hero_image || ''}
                  onChange={(url) => updateSectionField('about_page', 'hero_image', url)}
                  aspectRatio="aspect-[16/6]"
                  recommendedSize="1920 × 800 px (Recommended Hero Banner)"
                  placeholderText="Upload About Page Hero Banner (1920 x 800 px)"
                />
              </div>

              {/* Our Story & Heritage */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-sm text-gray-900">Our Story & Heritage</h4>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Story Heading</label>
                  <input
                    type="text"
                    value={cmsData.about_page?.story_heading || ''}
                    onChange={(e) => updateSectionField('about_page', 'story_heading', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Story Main Body Text</label>
                  <textarea
                    rows={4}
                    value={cmsData.about_page?.story_content || ''}
                    onChange={(e) => updateSectionField('about_page', 'story_content', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium leading-relaxed"
                  />
                </div>
              </div>

              {/* Craftsmanship & Sustainability */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Craftsmanship Section</h4>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={cmsData.about_page?.craftsmanship_title || ''}
                      onChange={(e) => updateSectionField('about_page', 'craftsmanship_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Content</label>
                    <textarea
                      rows={3}
                      value={cmsData.about_page?.craftsmanship_content || ''}
                      onChange={(e) => updateSectionField('about_page', 'craftsmanship_content', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                  <ImageUploader
                    label="Craftsmanship Image"
                    value={cmsData.about_page?.craftsmanship_image || ''}
                    onChange={(url) => updateSectionField('about_page', 'craftsmanship_image', url)}
                    aspectRatio="aspect-[4/5]"
                    recommendedSize="800 × 1000 px (Portrait Artistry)"
                    placeholderText="Upload Craftsmanship Portrait (800 x 1000 px)"
                  />
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <h4 className="font-bold text-sm text-gray-900">Sustainability Section</h4>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={cmsData.about_page?.sustainability_title || ''}
                      onChange={(e) => updateSectionField('about_page', 'sustainability_title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Content</label>
                    <textarea
                      rows={3}
                      value={cmsData.about_page?.sustainability_content || ''}
                      onChange={(e) => updateSectionField('about_page', 'sustainability_content', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                  <ImageUploader
                    label="Sustainability Image"
                    value={cmsData.about_page?.sustainability_image || ''}
                    onChange={(url) => updateSectionField('about_page', 'sustainability_image', url)}
                    aspectRatio="aspect-[4/5]"
                    recommendedSize="800 × 1000 px (Portrait Eco)"
                    placeholderText="Upload Sustainability Portrait (800 x 1000 px)"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Contact Page CMS Tab */}
        {activeTab === 'contact_page' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-brand-600" /> Contact Page Content Management
                </h3>
                <p className="text-xs text-gray-500">Manage hero banner, email, phone, studio address, working hours, and map location displayed on /contact.</p>
              </div>
              <button
                onClick={() => handleSaveSection('contact_page')}
                disabled={savingSection === 'contact_page'}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {savingSection === 'contact_page' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Contact Page</span>
              </button>
            </div>

            <div className="space-y-6 text-xs">
              <ImageUploader
                label="Contact Header Banner Image"
                value={cmsData.contact_page?.hero_image || ''}
                onChange={(url) => updateSectionField('contact_page', 'hero_image', url)}
                aspectRatio="aspect-[16/6]"
                recommendedSize="1920 × 800 px (Recommended Banner)"
                placeholderText="Upload Contact Header Banner (1920 x 800 px)"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Page Title</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.hero_title || ''}
                    onChange={(e) => updateSectionField('contact_page', 'hero_title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Page Subtitle</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.hero_subtitle || ''}
                    onChange={(e) => updateSectionField('contact_page', 'hero_subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Support Email</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.email || ''}
                    onChange={(e) => updateSectionField('contact_page', 'email', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.phone || ''}
                    onChange={(e) => updateSectionField('contact_page', 'phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">WhatsApp Support Number</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.whatsapp || ''}
                    onChange={(e) => updateSectionField('contact_page', 'whatsapp', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fashion Studio Full Address</label>
                <textarea
                  rows={2}
                  value={cmsData.contact_page?.address || ''}
                  onChange={(e) => updateSectionField('contact_page', 'address', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Working Hours Text</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.working_hours || ''}
                    onChange={(e) => updateSectionField('contact_page', 'working_hours', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Google Maps Embed URL</label>
                  <input
                    type="text"
                    value={cmsData.contact_page?.google_maps_url || ''}
                    onChange={(e) => updateSectionField('contact_page', 'google_maps_url', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Why Jalyn Values Tab (CRUD) */}
        {activeTab === 'why_jalyn' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-brand-600" /> Why Jalyn — Brand Values
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = [
                      ...(cmsData.why_jalyn?.values || []),
                      { title: 'New Brand Value', description: 'Description of brand promise' },
                    ];
                    updateSectionField('why_jalyn', 'values', next);
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Brand Value
                </button>

                <button
                  onClick={() => handleSaveSection('why_jalyn')}
                  disabled={savingSection === 'why_jalyn'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'why_jalyn' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Values</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={cmsData.why_jalyn?.title || ''}
                  onChange={(e) => updateSectionField('why_jalyn', 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <h4 className="font-bold text-gray-800 pt-2">Brand Values List ({cmsData.why_jalyn?.values?.length || 0})</h4>
              {cmsData.why_jalyn?.values?.map((val, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => {
                        const next = [...cmsData.why_jalyn.values];
                        next[idx].title = e.target.value;
                        updateSectionField('why_jalyn', 'values', next);
                      }}
                      placeholder="Value Title"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-900 bg-white"
                    />
                    <input
                      type="text"
                      value={val.description}
                      onChange={(e) => {
                        const next = [...cmsData.why_jalyn.values];
                        next[idx].description = e.target.value;
                        updateSectionField('why_jalyn', 'values', next);
                      }}
                      placeholder="Description"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = cmsData.why_jalyn.values.filter((_, i) => i !== idx);
                      updateSectionField('why_jalyn', 'values', next);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Services Promises Tab (CRUD) */}
        {activeTab === 'services_strip' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-600" /> Services / Promises Strip
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = [
                      ...(cmsData.services_strip?.promises || []),
                      { icon: 'sparkles', title: 'New Promise', description: 'Service guarantee details' },
                    ];
                    updateSectionField('services_strip', 'promises', next);
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Promise Item
                </button>

                <button
                  onClick={() => handleSaveSection('services_strip')}
                  disabled={savingSection === 'services_strip'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'services_strip' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Promises</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-500">Manage service promises (icon keys: truck, refresh, shield, sparkles):</p>
              {cmsData.services_strip?.promises?.map((p, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={p.icon}
                      onChange={(e) => {
                        const next = [...cmsData.services_strip.promises];
                        next[idx].icon = e.target.value;
                        updateSectionField('services_strip', 'promises', next);
                      }}
                      placeholder="Icon key"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-mono text-gray-600 bg-white"
                    />
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => {
                        const next = [...cmsData.services_strip.promises];
                        next[idx].title = e.target.value;
                        updateSectionField('services_strip', 'promises', next);
                      }}
                      placeholder="Title"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-800 bg-white"
                    />
                    <input
                      type="text"
                      value={p.description}
                      onChange={(e) => {
                        const next = [...cmsData.services_strip.promises];
                        next[idx].description = e.target.value;
                        updateSectionField('services_strip', 'promises', next);
                      }}
                      placeholder="Description"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = cmsData.services_strip.promises.filter((_, i) => i !== idx);
                      updateSectionField('services_strip', 'promises', next);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Promo Banner Tab */}
        {activeTab === 'promo_banner' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-600" /> Promotional Festive Banner
              </h3>
              <button
                onClick={() => handleSaveSection('promo_banner')}
                disabled={savingSection === 'promo_banner'}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {savingSection === 'promo_banner' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Banner</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Badge Tagline</label>
                  <input
                    type="text"
                    value={cmsData.promo_banner?.badge || ''}
                    onChange={(e) => updateSectionField('promo_banner', 'badge', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-brand-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={cmsData.promo_banner?.title || ''}
                    onChange={(e) => updateSectionField('promo_banner', 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={cmsData.promo_banner?.subtitle || ''}
                  onChange={(e) => updateSectionField('promo_banner', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={cmsData.promo_banner?.cta_text || ''}
                    onChange={(e) => updateSectionField('promo_banner', 'cta_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={cmsData.promo_banner?.cta_link || ''}
                    onChange={(e) => updateSectionField('promo_banner', 'cta_link', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <ImageUploader
                label="Promo Background Image (Multer Upload)"
                value={cmsData.promo_banner?.bg_image}
                onChange={(url) => updateSectionField('promo_banner', 'bg_image', url)}
                aspectRatio="aspect-[16/6]"
              />
            </div>
          </div>
        )}

        {/* 7. Instagram Feed Tab (CRUD) */}
        {activeTab === 'instagram_feed' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Instagram className="w-5 h-5 text-brand-600" /> Instagram Feed Posts
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextPosts = [
                      ...(cmsData.instagram_feed?.posts || []),
                      { id: Date.now(), image: '', link: cmsData.instagram_feed?.url || '' },
                    ];
                    updateSectionField('instagram_feed', 'posts', nextPosts);
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Post Image
                </button>

                <button
                  onClick={() => handleSaveSection('instagram_feed')}
                  disabled={savingSection === 'instagram_feed'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'instagram_feed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Feed</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={cmsData.instagram_feed?.handle || ''}
                    onChange={(e) => updateSectionField('instagram_feed', 'handle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Profile URL</label>
                  <input
                    type="text"
                    value={cmsData.instagram_feed?.url || ''}
                    onChange={(e) => updateSectionField('instagram_feed', 'url', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <h4 className="font-bold text-gray-800 pt-2">
                Post Images ({cmsData.instagram_feed?.posts?.length || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {cmsData.instagram_feed?.posts?.map((post, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[11px]">Post #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextPosts = cmsData.instagram_feed.posts.filter((_, i) => i !== idx);
                          updateSectionField('instagram_feed', 'posts', nextPosts);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    <ImageUploader
                      label="Upload Image (Multer)"
                      value={typeof post === 'string' ? post : post.image}
                      onChange={(url) => {
                        const nextPosts = [...cmsData.instagram_feed.posts];
                        nextPosts[idx] = { ...nextPosts[idx], image: url };
                        updateSectionField('instagram_feed', 'posts', nextPosts);
                      }}
                      aspectRatio="aspect-square"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. Header Navigation Menu Tab (Order Placement & Submenu CRUD) */}
        {activeTab === 'menu_arrangement' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-brand-600" /> Header Navigation Menu (Order Placement &amp; Submenu CRUD)
                </h3>
                <p className="text-[11px] text-gray-500">Reorder top-level menu items, toggle accent highlights, and manage dropdown submenus.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextLinks = [
                      ...(cmsData.menu_arrangement?.nav_links || []),
                      { label: 'New Menu Item', href: '/shop', children: [] },
                    ];
                    updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Top Menu Item
                </button>

                <button
                  onClick={() => handleSaveSection('menu_arrangement')}
                  disabled={savingSection === 'menu_arrangement'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'menu_arrangement' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Navigation</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {cmsData.menu_arrangement?.nav_links?.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3">
                  {/* Top Level Item Header */}
                  <div className="flex items-center justify-between border-b border-gray-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-xs bg-white px-2 py-0.5 rounded border border-gray-200">
                        Position #{idx + 1}
                      </span>
                      <span className="font-bold text-brand-700">{item.label}</span>
                    </div>

                    {/* Order Placement Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          if (idx === 0) return;
                          const nextLinks = [...cmsData.menu_arrangement.nav_links];
                          const [moved] = nextLinks.splice(idx, 1);
                          nextLinks.splice(idx - 1, 0, moved);
                          updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                        }}
                        className="p-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Menu Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === cmsData.menu_arrangement.nav_links.length - 1}
                        onClick={() => {
                          if (idx === cmsData.menu_arrangement.nav_links.length - 1) return;
                          const nextLinks = [...cmsData.menu_arrangement.nav_links];
                          const [moved] = nextLinks.splice(idx, 1);
                          nextLinks.splice(idx + 1, 0, moved);
                          updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                        }}
                        className="p-1 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Menu Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextLinks = cmsData.menu_arrangement.nav_links.filter((_, i) => i !== idx);
                          updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                        }}
                        className="p-1 rounded text-red-500 hover:bg-red-50 transition ml-1"
                        title="Delete Top Menu Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Top Level Item Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Menu Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const nextLinks = [...cmsData.menu_arrangement.nav_links];
                          nextLinks[idx].label = e.target.value;
                          updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-900 bg-white"
                        placeholder="Label"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Target URL (href)</label>
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => {
                          const nextLinks = [...cmsData.menu_arrangement.nav_links];
                          nextLinks[idx].href = e.target.value;
                          updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono text-gray-600 bg-white text-[11px]"
                        placeholder="/href"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                      <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.accent || false}
                          onChange={(e) => {
                            const nextLinks = [...cmsData.menu_arrangement.nav_links];
                            nextLinks[idx].accent = e.target.checked;
                            updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                          }}
                          className="h-4 w-4 text-red-600 rounded"
                        />
                        <span className="text-red-600 font-bold">Accent Red Text</span>
                      </label>
                    </div>
                  </div>

                  {/* Submenu Dropdown Items Section (CRUD) */}
                  <div className="pt-2 border-t border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-xs flex items-center gap-1">
                        Submenu Items ({item.children?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const nextLinks = [...cmsData.menu_arrangement.nav_links];
                          if (!nextLinks[idx].children) nextLinks[idx].children = [];
                          nextLinks[idx].children.push({
                            label: 'New Submenu Item',
                            href: '/shop',
                            subtitle: 'Submenu description',
                          });
                          updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                        }}
                        className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Submenu Item
                      </button>
                    </div>

                    {item.children?.length > 0 ? (
                      <div className="space-y-2 pl-3 border-l-2 border-brand-300">
                        {item.children.map((sub, subIdx) => (
                          <div key={subIdx} className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-2">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={sub.label}
                                onChange={(e) => {
                                  const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                  nextLinks[idx].children[subIdx].label = e.target.value;
                                  updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                }}
                                placeholder="Submenu Label"
                                className="px-2 py-1 rounded border border-gray-300 font-bold text-gray-900"
                              />
                              <input
                                type="text"
                                value={sub.href}
                                onChange={(e) => {
                                  const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                  nextLinks[idx].children[subIdx].href = e.target.value;
                                  updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                }}
                                placeholder="Target URL"
                                className="px-2 py-1 rounded border border-gray-300 font-mono text-[11px]"
                              />
                              <input
                                type="text"
                                value={sub.subtitle || ''}
                                onChange={(e) => {
                                  const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                  nextLinks[idx].children[subIdx].subtitle = e.target.value;
                                  updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                }}
                                placeholder="Subtitle (optional)"
                                className="px-2 py-1 rounded border border-gray-300 text-[11px]"
                              />
                            </div>

                            {/* Submenu Order & Delete Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={subIdx === 0}
                                onClick={() => {
                                  if (subIdx === 0) return;
                                  const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                  const [moved] = nextLinks[idx].children.splice(subIdx, 1);
                                  nextLinks[idx].children.splice(subIdx - 1, 0, moved);
                                  updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                }}
                                className="p-0.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
                                title="Move Submenu Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={subIdx === item.children.length - 1}
                                onClick={() => {
                                  if (subIdx === item.children.length - 1) return;
                                  const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                  const [moved] = nextLinks[idx].children.splice(subIdx, 1);
                                  nextLinks[idx].children.splice(subIdx + 1, 0, moved);
                                  updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                }}
                                className="p-0.5 rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
                                title="Move Submenu Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                  nextLinks[idx].children = nextLinks[idx].children.filter((_, i) => i !== subIdx);
                                  updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition"
                                title="Delete Submenu Item"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 italic pl-2">No submenu dropdown items configured for this link.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Footer Settings & Columns Tab (CRUD) */}
        {activeTab === 'footer_settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <Columns className="w-5 h-5 text-brand-600" /> Footer Settings &amp; Column Links
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextCols = [
                      ...(cmsData.footer_settings?.columns || []),
                      { title: 'New Column', links: [{ label: 'Sample Link', href: '/shop' }] },
                    ];
                    updateSectionField('footer_settings', 'columns', nextCols);
                  }}
                  className="px-3 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Footer Column
                </button>

                <button
                  onClick={() => handleSaveSection('footer_settings')}
                  disabled={savingSection === 'footer_settings'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'footer_settings' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Footer</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">About Brand Snippet</label>
                <textarea
                  rows={2}
                  value={cmsData.footer_settings.about_text}
                  onChange={(e) => updateSectionField('footer_settings', 'about_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Instagram Link</label>
                  <input
                    type="text"
                    value={cmsData.footer_settings.instagram_link}
                    onChange={(e) => updateSectionField('footer_settings', 'instagram_link', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Facebook Link</label>
                  <input
                    type="text"
                    value={cmsData.footer_settings.facebook_link}
                    onChange={(e) => updateSectionField('footer_settings', 'facebook_link', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
              </div>

              {/* Editable Footer Columns */}
              <div className="pt-3 border-t border-gray-100 space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">
                  Footer Link Columns ({cmsData.footer_settings?.columns?.length || 0})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cmsData.footer_settings?.columns?.map((col, colIdx) => (
                    <div key={colIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={col.title}
                          onChange={(e) => {
                            const nextCols = [...cmsData.footer_settings.columns];
                            nextCols[colIdx].title = e.target.value;
                            updateSectionField('footer_settings', 'columns', nextCols);
                          }}
                          className="font-bold text-sm text-brand-700 bg-white px-2 py-1 rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nextCols = cmsData.footer_settings.columns.filter((_, i) => i !== colIdx);
                            updateSectionField('footer_settings', 'columns', nextCols);
                          }}
                          className="text-red-500 hover:underline text-[11px] cursor-pointer"
                        >
                          Delete Column
                        </button>
                      </div>

                      <div className="space-y-2">
                        {col.links?.map((lnk, lnkIdx) => (
                          <div key={lnkIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={lnk.label}
                              onChange={(e) => {
                                const nextCols = [...cmsData.footer_settings.columns];
                                nextCols[colIdx].links[lnkIdx].label = e.target.value;
                                updateSectionField('footer_settings', 'columns', nextCols);
                              }}
                              placeholder="Link Label"
                              className="w-1/2 px-2 py-1 rounded border border-gray-200 bg-white"
                            />
                            <input
                              type="text"
                              value={lnk.href}
                              onChange={(e) => {
                                const nextCols = [...cmsData.footer_settings.columns];
                                nextCols[colIdx].links[lnkIdx].href = e.target.value;
                                updateSectionField('footer_settings', 'columns', nextCols);
                              }}
                              placeholder="/href"
                              className="w-1/2 px-2 py-1 rounded border border-gray-200 bg-white font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextCols = [...cmsData.footer_settings.columns];
                                nextCols[colIdx].links = nextCols[colIdx].links.filter((_, i) => i !== lnkIdx);
                                updateSectionField('footer_settings', 'columns', nextCols);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            const nextCols = [...cmsData.footer_settings.columns];
                            nextCols[colIdx].links.push({ label: 'New Link', href: '/shop' });
                            updateSectionField('footer_settings', 'columns', nextCols);
                          }}
                          className="text-[11px] font-bold text-brand-600 hover:underline pt-1 cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Link to {col.title}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
