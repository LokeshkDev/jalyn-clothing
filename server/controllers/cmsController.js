import pool from '../config/db.js';

// Default CMS homepage & layout section structures
const DEFAULT_CMS_DATA = {
  announcement_bar: {
    enabled: true,
    text: '✨ FREE SHIPPING ON ORDERS OVER ₹1999 | USE CODE JALYN10 FOR 10% OFF ✨',
    link: '/shop',
    bg_color: '#FFF6F9',
    text_color: '#4A2F3C',
  },
  hero_banner: {
    heading: 'Style Meets Comfort',
    subheading: 'Elevate your everyday wardrobe with our luxury silhouettes designed for breathability and grace.',
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
      {
        id: 2,
        eyebrow: 'Festive Grace',
        title: 'Timeless',
        highlight: 'Ethnic Wear',
        subtitle: 'Artisanal ethnic wear featuring intricate embroidery and royal silk drapes.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=80',
        cta: 'Shop Ethnic',
        href: '/shop?category=ethnic',
      },
    ],
  },
  category_grid: {
    title: 'Curated for Every You',
    subtitle: 'Browse handpicked styles for every mood',
    categories: [
      { id: 'dresses', title: 'Dresses & Gowns', subtitle: '28+ Items', slug: 'dresses', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
      { id: 'ethnic', title: 'Ethnic Wear', subtitle: '22+ Items', slug: 'ethnic', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80' },
      { id: 'coords', title: 'Co-ord Sets', subtitle: '18+ Items', slug: 'coords', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80' },
      { id: 'tops', title: 'Tops & Blouses', subtitle: '20+ Items', slug: 'tops', image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80' },
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
  instagram_feed: {
    handle: '@jalyn.apparels',
    url: 'https://www.instagram.com/jalyn.apparels/',
    posts: [
      { id: 1, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
      { id: 2, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
      { id: 3, image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
      { id: 4, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
      { id: 5, image: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
      { id: 6, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', link: 'https://www.instagram.com/jalyn.apparels/' },
    ],
  },
  menu_arrangement: {
    nav_links: [
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
      {
        label: 'Clothing',
        href: '/shop',
        hasDropdown: true,
        children: [
          { label: 'Dresses & Gowns', href: '/shop?category=dresses', subtitle: 'Flattering silhouettes' },
          { label: 'Tops & Blouses', href: '/shop?category=tops', subtitle: 'Everyday chic' },
          { label: 'Co-ord Sets', href: '/shop?category=coords', subtitle: 'Matching essentials' },
        ],
      },
      {
        label: 'Categories',
        href: '/shop',
        hasDropdown: true,
        children: [
          { label: 'Ethnic Wear', href: '/shop?category=ethnic', subtitle: 'Traditional elegance' },
          { label: 'Designer Sarees', href: '/shop?category=sarees', subtitle: 'Timeless classics' },
        ],
      },
      { label: 'Shop All', href: '/shop' },
      { label: 'Sale', href: '/collections/sale', accent: true },
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
        title: 'Shop',
        links: [
          { label: 'New Arrivals', href: '/collections/new-arrivals' },
          { label: 'Dresses', href: '/shop?category=dresses' },
          { label: 'Tops & Blouses', href: '/shop?category=tops' },
          { label: 'Co-ord Sets', href: '/shop?category=coords' },
          { label: 'Ethnic Wear', href: '/shop?category=ethnic' },
          { label: 'Sale', href: '/collections/sale' },
        ],
      },
      {
        title: 'Customer Care',
        links: [
          { label: 'Contact Us', href: '/contact' },
          { label: 'Shipping & Delivery', href: '/shipping-policy' },
          { label: 'Returns & Exchanges', href: '/return-policy' },
          { label: 'Track Order', href: '/track-order' },
          { label: 'Size Guide', href: '/size-guide' },
        ],
      },
      {
        title: 'About',
        links: [
          { label: 'Our Story', href: '/about' },
          { label: 'Craftsmanship', href: '/craftsmanship' },
          { label: 'Sustainability', href: '/sustainability' },
          { label: 'Press & Media', href: '/press' },
          { label: 'Careers', href: '/careers' },
        ],
      },
      {
        title: 'Policies',
        links: [
          { label: 'Privacy Policy', href: '/privacy-policy' },
          { label: 'Terms of Service', href: '/terms-and-conditions' },
          { label: 'Refund Policy', href: '/refund-policy' },
        ],
      },
    ],
  },
};

const inMemoryCmsStore = { ...DEFAULT_CMS_DATA };

async function ensureCmsTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`cms_homepage_sections\` (
        \`section_key\` VARCHAR(100) PRIMARY KEY,
        \`section_name\` VARCHAR(100) NOT NULL,
        \`content\` JSON NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    return true;
  } catch (err) {
    console.warn('Could not auto-create cms_homepage_sections table:', err.message);
    return false;
  }
}

export const getHomepageSections = async (req, res) => {
  try {
    await ensureCmsTableExists();
    const [rows] = await pool.query('SELECT * FROM cms_homepage_sections');
    
    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        data: inMemoryCmsStore,
      });
    }

    const sections = {};
    rows.forEach((row) => {
      try {
        sections[row.section_key] = typeof row.content === 'string' ? JSON.parse(row.content) : row.content;
      } catch (e) {
        sections[row.section_key] = row.content;
      }
    });

    const mergedData = { ...inMemoryCmsStore, ...sections };
    return res.json({
      success: true,
      data: mergedData,
    });
  } catch (error) {
    console.warn('DB query error in getHomepageSections, sending active in-memory data:', error.message);
    return res.json({
      success: true,
      data: inMemoryCmsStore,
    });
  }
};

export const updateHomepageSection = async (req, res) => {
  const { sectionKey } = req.params;
  let content = req.body;

  if (req.file) {
    const imageUrl = `/uploads/${req.file.filename}`;
    if (typeof content === 'object') {
      content.banner_image = imageUrl;
    }
  }

  inMemoryCmsStore[sectionKey] = content;

  try {
    await ensureCmsTableExists();
    const jsonContent = JSON.stringify(content);
    await pool.query(
      `INSERT INTO cms_homepage_sections (section_key, section_name, content)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE content = VALUES(content), section_name = VALUES(section_name)`,
      [sectionKey, sectionKey.replace('_', ' ').toUpperCase(), jsonContent]
    );

    return res.json({
      success: true,
      message: `Section '${sectionKey}' updated successfully`,
      data: content,
    });
  } catch (error) {
    console.warn(`Could not persist section '${sectionKey}' to DB, updated in-memory store:`, error.message);
    return res.json({
      success: true,
      message: `Section '${sectionKey}' updated in-memory`,
      data: content,
    });
  }
};
