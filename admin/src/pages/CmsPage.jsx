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
  Banknote,
  CreditCard,
  ShieldAlert,
  Users,
  UserPlus,
  UserCheck,
  Star,
  Monitor,
  Smartphone,
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
    recently_viewed: {
      title: 'Recently Viewed',
      enabled: true,
    },
    you_may_also_like: {
      title: 'You May Also Like',
      enabled: true,
    },
    featured_edits: {
      women: {
        heading: 'Featured Edit',
        title: 'Aesthetic Co-ord Sets',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
        cta_text: 'Shop Collection',
        cta_link: '/shop',
      },
      kids: {
        heading: 'Featured Edit',
        title: 'Playful Toddler Wear',
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=400&q=80',
        cta_text: 'Shop Collection',
        cta_link: '/shop',
      }
    },
  });

  const [activeTab, setActiveTab] = useState('homepage');
  const [layoutOrder, setLayoutOrder] = useState([
    'announcement_bar',
    'hero_banner',
    'category_grid',
    'featured_edits',
    'why_jalyn',
    'services_strip',
    'promo_banner',
    'new_arrivals',
    'exclusive_sale',
    'most_loved_styles',
    'instagram_feed',
  ]);
  const [layoutVisibility, setLayoutVisibility] = useState({
    announcement_bar: true,
    hero_banner: true,
    category_grid: true,
    featured_edits: true,
    why_jalyn: true,
    services_strip: true,
    promo_banner: true,
    new_arrivals: true,
    exclusive_sale: true,
    most_loved_styles: true,
    instagram_feed: true,
  });

  const [layoutDevice, setLayoutDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const MOBILE_DEFAULT_ORDER = [
    'hero_banner',
    'category_grid',
    'new_arrivals',
    'exclusive_sale',
    'most_loved_styles',
    'promo_banner',
    'why_jalyn',
    'services_strip',
    'instagram_feed',
  ];
  const [mobileLayoutOrder, setMobileLayoutOrder] = useState(MOBILE_DEFAULT_ORDER);
  const [mobileLayoutVisibility, setMobileLayoutVisibility] = useState({
    hero_banner: true,
    category_grid: true,
    new_arrivals: true,
    exclusive_sale: true,
    most_loved_styles: true,
    promo_banner: true,
    why_jalyn: true,
    services_strip: true,
    instagram_feed: true,
  });

  const [expandedSections, setExpandedSections] = useState({
    announcement_bar: true,
  });

  const toggleExpand = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleSaveLayout = async (newOrder, newVisibility, device = layoutDevice) => {
    try {
      await api.put(`/cms/homepage/${device === 'mobile' ? 'mobile_homepage_layout' : 'desktop_homepage_layout'}`, {
        order: newOrder,
        visibility: newVisibility,
      });
    } catch (err) {
      console.error('Failed to save layout configuration:', err);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    if (layoutDevice === 'mobile') {
      const newOrder = [...mobileLayoutOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
      setMobileLayoutOrder(newOrder);
      handleSaveLayout(newOrder, mobileLayoutVisibility, 'mobile');
    } else {
      const newOrder = [...layoutOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
      setLayoutOrder(newOrder);
      handleSaveLayout(newOrder, layoutVisibility, 'desktop');
    }
  };

  const moveDown = (index) => {
    const activeOrder = layoutDevice === 'mobile' ? mobileLayoutOrder : layoutOrder;
    if (index === activeOrder.length - 1) return;
    if (layoutDevice === 'mobile') {
      const newOrder = [...mobileLayoutOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
      setMobileLayoutOrder(newOrder);
      handleSaveLayout(newOrder, mobileLayoutVisibility, 'mobile');
    } else {
      const newOrder = [...layoutOrder];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
      setLayoutOrder(newOrder);
      handleSaveLayout(newOrder, layoutVisibility, 'desktop');
    }
  };

  const toggleVisibility = (sectionKey) => {
    if (layoutDevice === 'mobile') {
      const newVisibility = {
        ...mobileLayoutVisibility,
        [sectionKey]: mobileLayoutVisibility[sectionKey] !== false ? false : true,
      };
      setMobileLayoutVisibility(newVisibility);
      handleSaveLayout(mobileLayoutOrder, newVisibility, 'mobile');
    } else {
      const newVisibility = {
        ...layoutVisibility,
        [sectionKey]: layoutVisibility[sectionKey] !== false ? false : true,
      };
      setLayoutVisibility(newVisibility);
      handleSaveLayout(layoutOrder, newVisibility, 'desktop');
    }
  };

  

  // Migrate old combined sections (recently_viewed / you_may_also_like) to separate keys
  const migrateLayout = (order, visibility) => {
    const oldKeys = ['recently_viewed', 'you_may_also_like'];
    const newKeys = ['new_arrivals', 'exclusive_sale', 'most_loved_styles'];
    const filtered = (order || []).filter((k) => !oldKeys.includes(k));
    const replaceAt = (order || []).findIndex((k) => oldKeys.includes(k));
    if (replaceAt === -1) {
      newKeys.forEach((k) => {
        if (!filtered.includes(k)) filtered.push(k);
      });
    } else {
      let inserted = 0;
      newKeys.forEach((k) => {
        if (!filtered.includes(k)) {
          filtered.splice(replaceAt + inserted, 0, k);
          inserted += 1;
        }
      });
    }
    const vis = { ...(visibility || {}) };
    newKeys.forEach((k) => {
      if (vis[k] === undefined) vis[k] = true;
    });
    return { order: filtered, visibility: vis };
  };

  useEffect(() => {
    async function fetchCmsData() {
      try {
        const response = await api.get('/cms/homepage');
        if (response.data?.data) {
          setCmsData((prev) => ({
            ...prev,
            ...response.data.data,
            recently_viewed: response.data.data.recently_viewed || prev.recently_viewed,
            you_may_also_like: response.data.data.you_may_also_like || prev.you_may_also_like,
            featured_edits: response.data.data.featured_edits || prev.featured_edits,
          }));
          const layout = response.data.data.homepage_layout || response.data.data.desktop_homepage_layout;
          if (layout) {
            const migrated = migrateLayout(layout.order, layout.visibility);
            setLayoutOrder(migrated.order);
            setLayoutVisibility(migrated.visibility);
          }
          const mobileLayout = response.data.data.mobile_homepage_layout;
          if (mobileLayout) {
            const migratedMobile = migrateLayout(mobileLayout.order, mobileLayout.visibility);
            setMobileLayoutOrder(migratedMobile.order);
            setMobileLayoutVisibility(migratedMobile.visibility);
          }
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

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api.get('/auth/users');
        if (res.data?.data) setUserList(res.data.data);
      } catch (e) {
        console.warn('Could not fetch user list:', e.message);
      }
    }
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) return;
    setCreatingUser(true);
    try {
      const res = await api.post('/auth/users', newUserForm);
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        setNewUserForm({ name: '', email: '', phone: '', password: '', role: 'customer' });
        const resUsers = await api.get('/auth/users');
        if (resUsers.data?.data) setUserList(resUsers.data.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user' });
    } finally {
      setCreatingUser(false);
    }
  };


  const render_announcement_bar = () => (
    
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
        
  );

  const render_hero_banner = () => (
    
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
        
  );

  const render_category_grid = () => (
    
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
        
  );

  const render_why_jalyn = () => (
    
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
        
  );

  const render_services_strip = () => (
    
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
        
  );

  const render_promo_banner = () => (
    
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
        
  );

  const render_instagram_feed = () => (
    
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
        
  );

  const render_featured_edits = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" /> Megamenu Promo Cards
          </h3>
          <p className="text-[11px] text-gray-500">Edit the Featured Card content and upload images displayed in the Women and Kids megamenus.</p>
        </div>
        <button
          onClick={() => handleSaveSection('featured_edits')}
          disabled={savingSection === 'featured_edits'}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {savingSection === 'featured_edits' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Section</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Women Megamenu Featured Edit */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/30">
          <h4 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2">Women Megamenu Promo Card</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Badge Header</label>
              <input
                type="text"
                value={cmsData.featured_edits?.women?.heading || 'Featured Edit'}
                onChange={(e) => {
                  const women = { ...(cmsData.featured_edits?.women || {}), heading: e.target.value };
                  updateSectionField('featured_edits', 'women', women);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Promo Title</label>
              <input
                type="text"
                value={cmsData.featured_edits?.women?.title || 'Aesthetic Co-ord Sets'}
                onChange={(e) => {
                  const women = { ...(cmsData.featured_edits?.women || {}), title: e.target.value };
                  updateSectionField('featured_edits', 'women', women);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={cmsData.featured_edits?.women?.cta_text || 'Shop Collection'}
                  onChange={(e) => {
                    const women = { ...(cmsData.featured_edits?.women || {}), cta_text: e.target.value };
                    updateSectionField('featured_edits', 'women', women);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">CTA Redirect Link</label>
                <input
                  type="text"
                  value={cmsData.featured_edits?.women?.cta_link || '/shop'}
                  onChange={(e) => {
                    const women = { ...(cmsData.featured_edits?.women || {}), cta_link: e.target.value };
                    updateSectionField('featured_edits', 'women', women);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <ImageUploader
              label="Promo Image"
              value={cmsData.featured_edits?.women?.image || ''}
              onChange={(url) => {
                const women = { ...(cmsData.featured_edits?.women || {}), image: url };
                updateSectionField('featured_edits', 'women', women);
              }}
              aspectRatio="aspect-[3/4]"
            />
          </div>
        </div>

        {/* Kids Megamenu Featured Edit */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/30">
          <h4 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2">Kids Megamenu Promo Card</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Badge Header</label>
              <input
                type="text"
                value={cmsData.featured_edits?.kids?.heading || 'Featured Edit'}
                onChange={(e) => {
                  const kids = { ...(cmsData.featured_edits?.kids || {}), heading: e.target.value };
                  updateSectionField('featured_edits', 'kids', kids);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Promo Title</label>
              <input
                type="text"
                value={cmsData.featured_edits?.kids?.title || 'Playful Toddler Wear'}
                onChange={(e) => {
                  const kids = { ...(cmsData.featured_edits?.kids || {}), title: e.target.value };
                  updateSectionField('featured_edits', 'kids', kids);
                }}
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={cmsData.featured_edits?.kids?.cta_text || 'Shop Collection'}
                  onChange={(e) => {
                    const kids = { ...(cmsData.featured_edits?.kids || {}), cta_text: e.target.value };
                    updateSectionField('featured_edits', 'kids', kids);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">CTA Redirect Link</label>
                <input
                  type="text"
                  value={cmsData.featured_edits?.kids?.cta_link || '/shop'}
                  onChange={(e) => {
                    const kids = { ...(cmsData.featured_edits?.kids || {}), cta_link: e.target.value };
                    updateSectionField('featured_edits', 'kids', kids);
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <ImageUploader
              label="Promo Image"
              value={cmsData.featured_edits?.kids?.image || ''}
              onChange={(url) => {
                const kids = { ...(cmsData.featured_edits?.kids || {}), image: url };
                updateSectionField('featured_edits', 'kids', kids);
              }}
              aspectRatio="aspect-[3/4]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const render_recently_viewed = () => (
    <div className="space-y-4 text-xs pt-3 border-t border-gray-100">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={cmsData.recently_viewed?.title || 'Recently Viewed'}
          onChange={(e) => updateSectionField('recently_viewed', 'title', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={() => handleSaveSection('recently_viewed')}
          disabled={savingSection === 'recently_viewed'}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {savingSection === 'recently_viewed' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Recently Viewed</span>
        </button>
      </div>
    </div>
  );

  const render_you_may_also_like = () => (
    <div className="space-y-4 text-xs pt-3 border-t border-gray-100">
      <div>
        <label className="block font-semibold text-gray-700 mb-1">Section Title</label>
        <input
          type="text"
          value={cmsData.you_may_also_like?.title || 'You May Also Like'}
          onChange={(e) => updateSectionField('you_may_also_like', 'title', e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>
      <div className="flex justify-end pt-2">
        <button
          onClick={() => handleSaveSection('you_may_also_like')}
          disabled={savingSection === 'you_may_also_like'}
          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
        >
          {savingSection === 'you_may_also_like' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save You May Also Like</span>
        </button>
      </div>
    </div>
  );

  const render_auto_section = () => (
    <div className="text-xs pt-3 border-t border-gray-100 text-gray-500 leading-relaxed">
      <p className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <span>
          Auto-generated section pulled live from the product catalog. Control its visibility and position with the
          toggle and arrows above. Products are managed from the <b>New Arrivals</b> / <b>Sale</b> manager pages in the
          admin.
        </span>
      </p>
    </div>
  );

  const tabs = [
    { id: 'homepage', label: 'Homepage CMS', icon: Sliders },
    { id: 'about_page', label: 'About Page', icon: Sparkles },
    { id: 'contact_page', label: 'Contact Page', icon: Phone },
    { id: 'menu_arrangement', label: 'Header Menu', icon: Navigation },
    { id: 'footer_settings', label: 'Footer Columns', icon: Columns },
    { id: 'cod_settings', label: 'Payment & COD', icon: Banknote },
    { id: 'auth_page', label: 'Auth Editorial & Users', icon: Users },
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
        {/* Homepage CMS Layout Manager */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            {/* Device Switcher: Desktop vs Mobile layout */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">Homepage Section Layout</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Arrange and show/hide sections separately for desktop and mobile homepages.</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLayoutDevice('desktop')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${layoutDevice === 'desktop' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutDevice('mobile')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${layoutDevice === 'mobile' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </div>

            {(
              layoutDevice === 'mobile' ? mobileLayoutOrder : layoutOrder
            ).map((sectionKey, index) => {
              const activeOrder = layoutDevice === 'mobile' ? mobileLayoutOrder : layoutOrder;
              const activeVisibility = layoutDevice === 'mobile' ? mobileLayoutVisibility : layoutVisibility;
              const isExpanded = expandedSections[sectionKey];
              const isVisible = activeVisibility[sectionKey] !== false;
              
              let title = '';
              let Icon = Sliders;
              switch (sectionKey) {
                case 'announcement_bar': title = 'Top Announcement Bar'; Icon = Megaphone; break;
                case 'hero_banner': title = 'Hero Slides'; Icon = ImageIcon; break;
                case 'category_grid': title = 'Curated Categories'; Icon = LayoutGrid; break;
                case 'featured_edits': title = 'Megamenu Promo Cards'; Icon = Sparkles; break;
                case 'why_jalyn': title = 'Why Jalyn Values'; Icon = Heart; break;
                case 'services_strip': title = 'Services Promises'; Icon = Truck; break;
                case 'promo_banner': title = 'Promo Banner'; Icon = Tag; break;
                case 'new_arrivals': title = 'New Arrivals'; Icon = Sparkles; break;
                case 'exclusive_sale': title = 'Exclusive Sale'; Icon = Tag; break;
                case 'most_loved_styles': title = 'Most Loved Styles'; Icon = Heart; break;
                case 'recently_viewed': title = 'Recently Viewed'; Icon = Eye; break;
                case 'you_may_also_like': title = 'You May Also Like'; Icon = Star; break;
                case 'instagram_feed': title = 'Instagram Posts'; Icon = Instagram; break;
                default: title = sectionKey;
              }

              let renderer = () => null;
              if (sectionKey === 'announcement_bar') renderer = render_announcement_bar;
              if (sectionKey === 'hero_banner') renderer = render_hero_banner;
              if (sectionKey === 'category_grid') renderer = render_category_grid;
              if (sectionKey === 'featured_edits') renderer = render_featured_edits;
              if (sectionKey === 'why_jalyn') renderer = render_why_jalyn;
              if (sectionKey === 'services_strip') renderer = render_services_strip;
              if (sectionKey === 'promo_banner') renderer = render_promo_banner;
              if (sectionKey === 'instagram_feed') renderer = render_instagram_feed;
              if (sectionKey === 'recently_viewed') renderer = render_recently_viewed;
              if (sectionKey === 'you_may_also_like') renderer = render_you_may_also_like;
              if (sectionKey === 'new_arrivals' || sectionKey === 'exclusive_sale' || sectionKey === 'most_loved_styles') renderer = render_auto_section;

              return (
                <React.Fragment key={sectionKey}>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {/* Card Header */}
                    <div className="bg-gray-50/80 px-6 py-4 flex items-center justify-between border-b border-gray-200 select-none">
                      <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleExpand(sectionKey)}>
                        <Icon className="w-5 h-5 text-brand-600" />
                        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          {title}
                          {!isVisible && (
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold uppercase">
                              Hidden
                            </span>
                          )}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Visibility Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-500">{isVisible ? 'Visible' : 'Hidden'}</span>
                          <button
                            type="button"
                            onClick={() => toggleVisibility(sectionKey)}
                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
                              isVisible ? 'bg-emerald-600 justify-end' : 'bg-gray-300 justify-start'
                            }`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </button>
                        </div>

                        {/* Reorder Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(index)}
                            disabled={index === activeOrder.length - 1}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Expand Chevron */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(sectionKey)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Card Content */}
                    {isExpanded && (
                      <div className="p-6">
                        {renderer()}
                      </div>
                    )}
                  </div>
                  {index < activeOrder.length - 1 && (
                    <div className="w-full px-1 my-3">
                      <div className="h-[1.5px] bg-[#AD4A85]/20" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}



        {/* 1. Announcement Bar Tab */}
        

        {/* 2. Hero Banner & Slides Tab (CRUD) */}
        

        {/* 3. Curated Categories Tab (CRUD) */}
        

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
        

        {/* 5. Services Promises Tab (CRUD) */}
        

        {/* 6. Promo Banner Tab */}
        

        {/* 7. Instagram Feed Tab (CRUD) */}
        

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
                    <div className="flex items-center gap-6 pt-4">
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

                      <label className="flex items-center gap-1.5 font-semibold text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isMega || false}
                          onChange={(e) => {
                            const nextLinks = [...cmsData.menu_arrangement.nav_links];
                            nextLinks[idx].isMega = e.target.checked;
                            if (e.target.checked && !nextLinks[idx].groups) {
                              nextLinks[idx].groups = [];
                            }
                            updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                          }}
                          className="h-4 w-4 text-brand-600 rounded"
                        />
                        <span>Is Mega Dropdown (Multi-column with headers)</span>
                      </label>
                    </div>
                  </div>

                  {/* Mega Menu Groups (Multi-Column) vs Flat Dropdown Submenus */}
                  {item.isMega ? (
                    <div className="pt-2 border-t border-gray-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700 text-xs flex items-center gap-1">
                          Mega Menu Columns / Groups ({item.groups?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextLinks = [...cmsData.menu_arrangement.nav_links];
                            if (!nextLinks[idx].groups) nextLinks[idx].groups = [];
                            nextLinks[idx].groups.push({
                              title: 'New Column Title',
                              items: [],
                            });
                            updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                          }}
                          className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Mega Column
                        </button>
                      </div>

                      {item.groups?.length > 0 ? (
                        <div className="space-y-4 pl-3 border-l-2 border-brand-500">
                          {item.groups.map((group, groupIdx) => (
                            <div key={groupIdx} className="p-3 bg-gray-50/50 rounded-xl border border-gray-200 space-y-3">
                              {/* Group Header: Column Title & Delete */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-bold text-gray-400">Col Title:</span>
                                  <input
                                    type="text"
                                    value={group.title}
                                    onChange={(e) => {
                                      const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                      nextLinks[idx].groups[groupIdx].title = e.target.value;
                                      updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                    }}
                                    className="px-2 py-1 rounded border border-gray-300 font-bold text-gray-900 flex-1 text-xs"
                                    placeholder="Column Header Title"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                    nextLinks[idx].groups = nextLinks[idx].groups.filter((_, i) => i !== groupIdx);
                                    updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                  }}
                                  className="text-gray-400 hover:text-red-650 transition"
                                  title="Delete Mega Column"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                              </div>

                              {/* Group Items / Sublinks List */}
                              <div className="space-y-2 pl-3 border-l-2 border-gray-300">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-gray-500">Links ({group.items?.length || 0})</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                      if (!nextLinks[idx].groups[groupIdx].items) {
                                        nextLinks[idx].groups[groupIdx].items = [];
                                      }
                                      nextLinks[idx].groups[groupIdx].items.push({
                                        label: 'New Link',
                                        href: '/shop',
                                      });
                                      updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                    }}
                                    className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                                  >
                                    <Plus className="w-2.5 h-2.5" /> Add Link
                                  </button>
                                </div>

                                {group.items?.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {group.items.map((subItem, subItemIdx) => (
                                      <div key={subItemIdx} className="flex items-center gap-2 bg-white p-1.5 rounded border border-gray-200">
                                        <input
                                          type="text"
                                          value={subItem.label}
                                          onChange={(e) => {
                                            const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                            nextLinks[idx].groups[groupIdx].items[subItemIdx].label = e.target.value;
                                            updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                          }}
                                          placeholder="Label"
                                          className="flex-1 px-1.5 py-0.5 rounded border border-gray-300 text-xs font-semibold text-gray-800 bg-white"
                                        />
                                        <input
                                          type="text"
                                          value={subItem.href}
                                          onChange={(e) => {
                                            const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                            nextLinks[idx].groups[groupIdx].items[subItemIdx].href = e.target.value;
                                            updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                          }}
                                          placeholder="URL"
                                          className="flex-1 px-1.5 py-0.5 rounded border border-gray-300 text-[10px] font-mono text-gray-500 bg-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextLinks = [...cmsData.menu_arrangement.nav_links];
                                            nextLinks[idx].groups[groupIdx].items = nextLinks[idx].groups[groupIdx].items.filter((_, i) => i !== subItemIdx);
                                            updateSectionField('menu_arrangement', 'nav_links', nextLinks);
                                          }}
                                          className="text-gray-400 hover:text-red-500 transition"
                                          title="Delete Link"
                                        >
                                          <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-gray-400 italic">No links in this column.</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic pl-2">No mega columns configured.</p>
                      )}
                    </div>
                  ) : (
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
                  )}
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

        {/* 12. Payment & COD Settings Tab */}
        {activeTab === 'cod_settings' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-brand-600" /> Payment & Cash on Delivery (COD) Settings
                </h3>
                <p className="text-xs text-gray-500">Enable or disable COD storewide, configure fees, and set up Cashfree online payment options.</p>
              </div>
              <button
                onClick={() => handleSaveSection('cod_settings')}
                disabled={savingSection === 'cod_settings'}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {savingSection === 'cod_settings' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Payment Settings</span>
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* COD Enable / Disable Toggle Card */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-600" /> Enable Cash on Delivery (COD)
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, customers can choose Cash on Delivery at checkout. When disabled, COD option is hidden/disabled on checkout.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cmsData.cod_settings?.enabled ?? true}
                    onChange={(e) => updateSectionField('cod_settings', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Fee & Threshold Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <label className="block font-semibold text-gray-700">Minimum Order Amount for COD (₹)</label>
                  <input
                    type="number"
                    value={cmsData.cod_settings?.min_order_amount ?? 0}
                    onChange={(e) => updateSectionField('cod_settings', 'min_order_amount', Number(e.target.value))}
                    placeholder="0 (No minimum)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                  <p className="text-[11px] text-gray-400">Set 0 for no minimum amount requirement.</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <label className="block font-semibold text-gray-700">Additional COD Handling Fee (₹)</label>
                  <input
                    type="number"
                    value={cmsData.cod_settings?.cod_fee ?? 0}
                    onChange={(e) => updateSectionField('cod_settings', 'cod_fee', Number(e.target.value))}
                    placeholder="0 (Free COD)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                  <p className="text-[11px] text-gray-400">Set 0 if Cash on Delivery is free.</p>
                </div>
              </div>

              {/* COD Customer Notice */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="block font-semibold text-gray-700">COD Checkout Customer Notice</label>
                <textarea
                  rows={2}
                  value={cmsData.cod_settings?.notice || ''}
                  onChange={(e) => updateSectionField('cod_settings', 'notice', e.target.value)}
                  placeholder="Pay cash upon delivery at your doorstep."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>
            </div>

            {/* DELIVERY SETTINGS SHOW/HIDE CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-600" /> Website Delivery &amp; Pincode Settings
                  </h3>
                  <p className="text-xs text-gray-500">Show or hide delivery settings, pincode checkers, and shipping notices across PDP and Checkout.</p>
                </div>
                <button
                  onClick={() => handleSaveSection('delivery_settings')}
                  disabled={savingSection === 'delivery_settings'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'delivery_settings' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Delivery Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">Enable Delivery Settings &amp; Pincode Checker</h4>
                    <p className="text-gray-500 text-[11px]">When disabled, delivery pincode widgets will be hidden from PDP.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cmsData.delivery_settings?.enabled ?? true}
                      onChange={(e) => updateSectionField('delivery_settings', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <label className="block font-semibold text-gray-700">Shipping Notice / Banner Text</label>
                  <input
                    type="text"
                    value={cmsData.delivery_settings?.shipping_notice || ''}
                    onChange={(e) => updateSectionField('delivery_settings', 'shipping_notice', e.target.value)}
                    placeholder="Free Express Delivery on orders above ₹1,999"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* TAX ESTIMATION & BILLING SETTINGS CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-brand-600" /> Tax Estimation &amp; Billing Calculation
                  </h3>
                  <p className="text-xs text-gray-500">Configure exact tax percentage (e.g. 18% GST) and enable/disable the tax section during checkout billing.</p>
                </div>
                <button
                  onClick={() => handleSaveSection('tax_settings')}
                  disabled={savingSection === 'tax_settings'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'tax_settings' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Tax Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">Enable Tax Section in Billing</h4>
                    <p className="text-gray-500 text-[11px]">When disabled, tax line item will be hidden from checkout.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cmsData.tax_settings?.enabled ?? true}
                      onChange={(e) => updateSectionField('tax_settings', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <label className="block font-semibold text-gray-700">Exact Tax Percentage (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cmsData.tax_settings?.tax_percent ?? 18}
                    onChange={(e) => updateSectionField('tax_settings', 'tax_percent', Number(e.target.value))}
                    placeholder="18"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                  <p className="text-[11px] text-gray-400">e.g. 18 for 18% GST or 5 for 5% tax.</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                  <label className="block font-semibold text-gray-700">Custom Tax Display Label</label>
                  <input
                    type="text"
                    value={cmsData.tax_settings?.tax_label || ''}
                    onChange={(e) => updateSectionField('tax_settings', 'tax_label', e.target.value)}
                    placeholder="GST (18%)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                  <p className="text-[11px] text-gray-400">Displayed on the checkout order summary bill.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 13. Auth Editorial & Role-Based User Creation Tab */}
        {activeTab === 'auth_page' && (
          <div className="space-y-6">
            {/* Editorial Content & Banner Image Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" /> Auth Left Editorial Column Settings
                  </h3>
                  <p className="text-xs text-gray-500">Edit the left editorial image, badge, headline, and subtitle on the Login & Registration pages.</p>
                </div>
                <button
                  onClick={() => handleSaveSection('auth_page')}
                  disabled={savingSection === 'auth_page'}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingSection === 'auth_page' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Auth Editorial</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={cmsData.auth_page?.badge || ''}
                      onChange={(e) => updateSectionField('auth_page', 'badge', e.target.value)}
                      placeholder="JALYN EXCLUSIVE CLUB"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Headline Title</label>
                    <input
                      type="text"
                      value={cmsData.auth_page?.title || ''}
                      onChange={(e) => updateSectionField('auth_page', 'title', e.target.value)}
                      placeholder="Timeless Grace,"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Headline Highlight (Italic Accent)</label>
                    <input
                      type="text"
                      value={cmsData.auth_page?.title_highlight || ''}
                      onChange={(e) => updateSectionField('auth_page', 'title_highlight', e.target.value)}
                      placeholder="Crafted for You."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Subtitle Text</label>
                    <textarea
                      rows={3}
                      value={cmsData.auth_page?.subtitle || ''}
                      onChange={(e) => updateSectionField('auth_page', 'subtitle', e.target.value)}
                      placeholder="Sign in to manage your orders..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploader
                    label="Editorial Auth Backdrop Image"
                    recommendedSize="Recommended: 1400 × 1600 px (Auth Editorial Banner)"
                    value={cmsData.auth_page?.image || ''}
                    onChange={(url) => updateSectionField('auth_page', 'image', url)}
                    aspectRatio="portrait"
                  />
                </div>
              </div>

              {/* 3-SLIDE REVIEWS CAROUSEL EDITOR */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 3-Slide Customer Reviews Carousel
                    </h4>
                    <p className="text-xs text-gray-500">Edit the 3 customer review slides displayed on the left column.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(cmsData.auth_page?.reviews || [
                    { rating: 5, text: 'The fit and fabric quality from Jalyn are unmatched.', name: 'Ananya Kapoor', role: 'Verified Jalyn Collector', initials: 'AK' },
                    { rating: 5, text: 'Exquisite hand craftsmanship and incredible attention to detail.', name: 'Riddhi Sen', role: 'Luxury Fashion Enthusiast', initials: 'RS' },
                    { rating: 5, text: 'The custom fit assistance helped me get the perfect size co-ord set.', name: 'Meera Rajput', role: 'Loyal Jalyn Client', initials: 'MR' },
                  ]).map((rev, rIdx) => (
                    <div key={rIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-600">Review Slide #{rIdx + 1}</span>
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] text-gray-500 font-semibold">Rating:</label>
                          <select
                            value={rev.rating || 5}
                            onChange={(e) => {
                              const nextRevs = [...(cmsData.auth_page?.reviews || [])];
                              if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                              nextRevs[rIdx].rating = Number(e.target.value);
                              updateSectionField('auth_page', 'reviews', nextRevs);
                            }}
                            className="px-1 py-0.5 rounded border border-gray-300 font-bold bg-white text-[11px]"
                          >
                            <option value={5}>5 Stars ★★★★★</option>
                            <option value={4}>4 Stars ★★★★</option>
                            <option value={3}>3 Stars ★★★</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        value={rev.text || ''}
                        onChange={(e) => {
                          const nextRevs = [...(cmsData.auth_page?.reviews || [])];
                          if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                          nextRevs[rIdx].text = e.target.value;
                          updateSectionField('auth_page', 'reviews', nextRevs);
                        }}
                        placeholder="Review quote text..."
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-300 font-medium"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={rev.name || ''}
                          onChange={(e) => {
                            const nextRevs = [...(cmsData.auth_page?.reviews || [])];
                            if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                            nextRevs[rIdx].name = e.target.value;
                            updateSectionField('auth_page', 'reviews', nextRevs);
                          }}
                          placeholder="Author Name"
                          className="px-2 py-1 rounded-lg border border-gray-300 font-medium"
                        />

                        <input
                          type="text"
                          value={rev.initials || ''}
                          onChange={(e) => {
                            const nextRevs = [...(cmsData.auth_page?.reviews || [])];
                            if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                            nextRevs[rIdx].initials = e.target.value;
                            updateSectionField('auth_page', 'reviews', nextRevs);
                          }}
                          placeholder="Initials (e.g. AK)"
                          className="px-2 py-1 rounded-lg border border-gray-300 font-medium"
                        />
                      </div>

                      <input
                        type="text"
                        value={rev.role || ''}
                        onChange={(e) => {
                          const nextRevs = [...(cmsData.auth_page?.reviews || [])];
                          if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                          nextRevs[rIdx].role = e.target.value;
                          updateSectionField('auth_page', 'reviews', nextRevs);
                        }}
                        placeholder="Role / Tagline (e.g. Verified Client)"
                        className="w-full px-2 py-1 rounded-lg border border-gray-300 font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROLE-BASED USER CREATION & MANAGEMENT CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-600" /> Role-Based User Creation &amp; Management
                </h3>
                <p className="text-xs text-gray-500">Create new user accounts directly in MySQL DB and assign system roles (Customer, Admin, Store Manager, Staff).</p>
              </div>

              {/* Add User Form */}
              <form onSubmit={handleCreateUser} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-brand-600" /> Create New User Account
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserForm.name}
                      onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="user@jalyn.in"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Assigned Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Store Manager</option>
                      <option value="staff">Support Staff</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={creatingUser}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* User List Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Existing System Users ({userList.length})</h4>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700 uppercase">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {userList.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold text-gray-500">#{u.id}</td>
                          <td className="p-3 font-bold text-gray-900">{u.name}</td>
                          <td className="p-3 text-gray-600">{u.email}</td>
                          <td className="p-3 text-gray-600">{u.phone || '—'}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : u.role === 'manager'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : u.role === 'staff'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
