import pool from '../config/db.js';
import { processAndStoreImage } from '../services/imageService.js';

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
      {
        label: 'New Arrival',
        href: '/shop?category=new-arrivals',
        hasDropdown: true,
        children: [
          { label: 'Ethnic Wear', href: '/shop?category=ethnic' },
          { label: 'Casuals', href: '/shop?category=casuals' },
          { label: 'Formals', href: '/shop?category=formals' },
        ],
      },
      {
        label: 'Women',
        href: '/shop?category=women',
        hasDropdown: true,
        isMega: true,
        groups: [
          {
            title: 'Indian and Fusion Wear',
            items: [
              { label: 'Kurtis & Tunics', href: '/shop?category=kurtis-tunic' },
              { label: 'Co-Ord Sets', href: '/shop?category=coords' },
              { label: 'Salwar & Chudidars Set', href: '/shop?category=salwar-chudidar' },
              { label: 'Sharara & Lehenga', href: '/shop?category=sharara-lehenga' },
              { label: 'Short Kurtis', href: '/shop?category=short-kurti' },
              { label: 'Ethnic Wear', href: '/shop?category=ethnic-wear' },
              { label: 'Unstitched Material', href: '/shop?category=unstitched' },
              { label: 'Leggings, Patiyala & Kurtipants', href: '/shop?category=leggings-kurtipants' },
              { label: 'Dupattas & Shawls', href: '/shop?category=dupattas-shawls' },
            ],
          },
          {
            title: 'Western Wear',
            items: [
              { label: 'Dresses & Gowns', href: '/shop?category=dresses-gown' },
              { label: 'Shirts & Crop Tops', href: '/shop?category=shirt-croptops' },
              { label: 'T-Shirts', href: '/shop?category=tshirts' },
              { label: 'Jeans', href: '/shop?category=jeans' },
              { label: 'Short Tops', href: '/shop?category=short-tops' },
              { label: 'Co-ords', href: '/shop?category=western-coords' },
              { label: 'Palazzos', href: '/shop?category=palazzos' },
            ],
          },
          {
            title: 'Maternity Wear',
            items: [
              { label: 'Ethnic Tops', href: '/shop?category=maternity-ethnic-tops' },
              { label: 'Dresses & Gowns', href: '/shop?category=maternity-dresses' },
              { label: 'Nightwear Feeding', href: '/shop?category=nightwear-feeding' },
            ],
          },
          {
            title: 'Nightwear & Loungewear',
            items: [
              { label: 'PJs', href: '/shop?category=pjs' },
              { label: 'Shirts', href: '/shop?category=lounge-shirts' },
              { label: 'Nighties & Night Gowns', href: '/shop?category=nighties-nightgowns' },
            ],
          },
        ],
      },
      {
        label: 'Kids',
        href: '/shop?category=kids',
        hasDropdown: true,
        isMega: true,
        groups: [
          {
            title: 'Girls Clothing',
            items: [
              { label: 'Dresses', href: '/shop?category=girls-dress' },
              { label: 'T-Shirts', href: '/shop?category=girls-tshirt' },
              { label: 'Clothing Sets', href: '/shop?category=girls-clothing-set' },
              { label: 'Ethnic Wear', href: '/shop?category=girls-ethnic-wear' },
              { label: 'Sharara & Lehenga', href: '/shop?category=girls-sharara-lehenga' },
            ],
          },
          {
            title: 'Nightwear & Loungewear',
            items: [
              { label: 'Shirts', href: '/shop?category=kids-lounge-shirts' },
              { label: 'Pants', href: '/shop?category=kids-pants' },
              { label: 'Girls Frocks', href: '/shop?category=girls-frocks' },
              { label: 'Nightwear & Lounges', href: '/shop?category=kids-nightwear-lounges' },
            ],
          },
          {
            title: 'Toddlers',
            items: [
              { label: 'Clothing Sets', href: '/shop?category=toddlers-clothing-set' },
              { label: 'Frocks', href: '/shop?category=toddlers-frocks' },
              { label: 'Nightwear & Loungewear', href: '/shop?category=toddlers-nightwear' },
              { label: 'Western Wear Girls', href: '/shop?category=toddlers-western-girls' },
              { label: 'Western Wear Boys', href: '/shop?category=toddlers-western-boys' },
            ],
          },
          {
            title: 'Infants',
            items: [
              { label: 'Ethnic Wear', href: '/shop?category=infants-ethnic-wear' },
              { label: 'Western Wear', href: '/shop?category=infants-western-wear' },
              { label: 'Regular Wear', href: '/shop?category=infants-regular-wear' },
              { label: 'Nightwear', href: '/shop?category=infants-nightwear' },
            ],
          },
        ],
      },
      {
        label: 'Plus Curve',
        href: '/shop?category=plus-curve',
        hasDropdown: true,
        children: [
          { label: 'Maxies', href: '/shop?category=maxies' },
          { label: 'Chudi Set', href: '/shop?category=chudi-set' },
          { label: 'Tops', href: '/shop?category=plus-tops' },
          { label: 'Nightwear & Loungewear', href: '/shop?category=plus-nightwear' },
          { label: 'Nighties', href: '/shop?category=plus-nighties' },
        ],
      },
      {
        label: 'Combo',
        href: '/shop?category=combo',
        hasDropdown: true,
        children: [
          { label: 'Western Combo Women', href: '/shop?category=combo-western-women' },
          { label: 'Western Combo Kids', href: '/shop?category=combo-western-kids' },
          { label: 'College Combo', href: '/shop?category=combo-college' },
          { label: 'Formal Combo', href: '/shop?category=combo-formal' },
          { label: 'Nightwear & Loungewear Combo', href: '/shop?category=combo-nightwear' },
        ],
      },
      { label: 'About Us', href: '/about' },
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
        ],
      },
      {
        title: 'About Jalyn',
        links: [
          { label: 'Our Story', href: '/about' },
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
      {
        title: 'My Account',
        links: [
          { label: 'My Orders', href: '/profile/orders' },
          { label: 'My Wishlist', href: '/profile/wishlist' },
          { label: 'Addresses', href: '/profile/addresses' },
          { label: 'Returns', href: '/profile/returns' },
          { label: 'Help & Support', href: '/profile/help' },
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
    faqs: [
      {
        q: 'How long will delivery take for my order?',
        a: 'Standard shipping takes 3 to 5 business days across major metro cities in India, and 5 to 7 business days for other tier-2 & tier-3 locations.',
      },
      {
        q: 'What is your returns and exchange policy?',
        a: 'We offer a hassle-free 7-day return and exchange policy from the date of delivery. Items must be unworn, unwashed, and have original tags intact.',
      },
      {
        q: 'How do I choose the correct size?',
        a: 'Please refer to our Size Guide on product pages or footer for exact body measurements. If you are between sizes, we recommend opting for the larger size for a relaxed fit.',
      },
      {
        q: 'Can I request custom alterations?',
        a: 'Yes! For select ethnic collections and evening gowns, custom sizing & length adjustments can be requested by reaching out to our WhatsApp support team.',
      },
    ],
  },
  help_support_page: {
    title: 'Help & Support',
    subtitle: 'We are here to assist you with any questions or order concerns',
    faqs: [
      {
        q: 'How do I track my order?',
        a: 'You can track your order by navigating to My Orders -> View Details. We also send live WhatsApp and email updates once your order is dispatched.',
      },
      {
        q: 'What is the return policy for JALYN items?',
        a: 'We offer a 7-day hassle-free return and exchange policy from the date of delivery. Items must be unworn with original tags attached.',
      },
      {
        q: 'Are custom size alterations available?',
        a: 'Yes! Please check our Size Guide or reach out to our WhatsApp support team with your custom measurements before placing your order.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Online Payments (UPI, Credit/Debit Cards, Net Banking, Wallets) as well as Cash on Delivery (COD) across India.',
      },
    ],
  },
  policy_pages: {
    shipping_delivery: {
      title: 'Shipping & Delivery Policy',
      content_html:
        '<p>At JALYN, every order is treated with utmost care. Our garments are inspected and dispatched directly from our Mumbai studio in sustainable luxury packaging.</p>' +
        '<div class="grid sm:grid-cols-2 gap-4 my-6"><div class="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2]"><h4 class="font-semibold text-sm text-[#2C1C24]">Standard Domestic Shipping</h4><p class="text-xs text-gray-500 mt-1">3 – 5 Business Days</p><p class="text-xs text-[#C28E5C] font-semibold mt-2">FREE on orders above ₹1,999</p></div><div class="p-5 rounded-2xl bg-[#FAF7F5] border border-[#EFE8E2]"><h4 class="font-semibold text-sm text-[#2C1C24]">Express Shipping</h4><p class="text-xs text-gray-500 mt-1">1 – 2 Business Days (Metro Cities)</p><p class="text-xs text-gray-600 mt-2">Nominal fee of ₹150</p></div></div>' +
        '<h3 class="text-lg font-serif text-[#2C1C24] pt-4 border-t border-gray-100">Tracking Your Package</h3>' +
        '<p>Once dispatched, you will receive an SMS and email containing your AWB tracking number and live order link. For any tracking assistance, please email <a href="mailto:support@jalyn.in" class="text-[#C28E5C] font-medium underline">support@jalyn.in</a> with your Order ID.</p>',
    },
    returns_exchanges: {
      title: 'Returns & Exchanges Policy',
      content_html:
        '<p>We want you to love your JALYN purchase. If the fit or style isn’t perfect, we offer a hassle-free 7-day return &amp; exchange window.</p>' +
        '<div class="p-6 rounded-2xl bg-[#FFF6F9] border border-rose-100 space-y-3"><h4 class="font-semibold text-sm text-[#4A2F3C] flex items-center gap-2">7-Day Easy Return Guarantee</h4><ul class="text-xs text-gray-600 space-y-2 list-disc list-inside font-light"><li>Items must be unworn, unwashed, and in original condition with tags attached.</li><li>Reverse doorstep pickup will be arranged by our logistics partners.</li><li>Exchanges for a different size are complimentary with zero extra delivery fee.</li></ul></div>' +
        '<div class="pt-4 border-t border-gray-100"><h3 class="text-lg font-serif text-[#2C1C24]">How to Request a Return</h3><p class="text-sm text-gray-600 font-light mt-2">Go to <a href="/profile/orders" class="text-[#C28E5C] font-medium underline">My Orders</a> section in your profile or email <a href="mailto:support@jalyn.in" class="text-[#C28E5C] underline">support@jalyn.in</a> with your Order ID.</p></div>',
    },
    privacy_policy: {
      title: 'Privacy Policy',
      content_html:
        '<p>Your privacy is paramount to us. JALYN Apparels collects only necessary information required to process your orders, process payments securely, and deliver exceptional service. We never sell or share your personal data with third-party advertisers.</p>',
    },
    terms_of_service: {
      title: 'Terms of Service',
      content_html:
        '<p>By visiting our website and placing an order, you agree to be bound by our standard terms and conditions. All prices displayed are inclusive of GST. Product colors may slightly vary due to studio lighting and monitor settings.</p>',
    },
    refund_policy: {
      title: 'Refund Policy',
      content_html:
        '<p>Once your returned product passes quality inspection at our warehouse, your refund will be credited back to your original payment method (Credit Card, Debit Card, UPI, Netbanking) within 5 – 7 business days.</p>',
    },
  },
  cod_settings: {
    enabled: true,
    min_order_amount: 0,
    cod_fee: 0,
    notice: 'Pay cash upon delivery at your doorstep.',
  },
  auth_page: {
    badge: 'JALYN EXCLUSIVE CLUB',
    title: 'Timeless Grace,',
    title_highlight: 'Crafted for You.',
    subtitle: 'Sign in to manage your orders, access member-only private sales, save favorite couture pieces, and enjoy personalized tailoring assistance.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=80',
    reviews: [
      {
        id: 1,
        rating: 5,
        text: '“The fit and fabric quality from Jalyn are unmatched. Shopping here feels like stepping into a personal luxury studio.”',
        name: 'Ananya Kapoor',
        role: 'Verified Jalyn Collector',
        initials: 'AK',
      },
      {
        id: 2,
        rating: 5,
        text: '“Exquisite hand craftsmanship and incredible attention to detail. Delivery was prompt and packaging felt truly regal.”',
        name: 'Riddhi Sen',
        role: 'Luxury Fashion Enthusiast',
        initials: 'RS',
      },
      {
        id: 3,
        rating: 5,
        text: '“The custom fit assistance helped me get the perfect size co-ord set. I receive compliments every time I wear it!”',
        name: 'Meera Rajput',
        role: 'Loyal Jalyn Client',
        initials: 'MR',
      },
    ],
  },
  delivery_settings: {
    enabled: true,
    show_pincode_checker: true,
    shipping_notice: 'Free Express Delivery on orders above ₹1,999',
  },
  tax_settings: {
    enabled: true,
    tax_percent: 18,
    tax_label: 'GST (18%)',
    inclusive: false,
  },
  shipping_methods: {
    standard: {
      enabled: true,
      title: 'Standard Delivery',
      subtitle: 'Delivery in 3 to 5 business days',
      price: 99,
      free_threshold: 1999,
    },
    express: {
      enabled: true,
      title: 'Express Delivery',
      subtitle: 'Fast delivery in 1 to 2 business days',
      price: 199,
    },
  },
  desktop_homepage_layout: {
    order: [
      'announcement_bar',
      'hero_banner',
      'category_grid',
      'featured_edits',
      'why_jalyn',
      'services_strip',
      'promo_banner',
      'new_arrivals',
      'exclusive_sale',
      'our_products',
      'instagram_feed',
    ],
    visibility: {
      announcement_bar: true,
      hero_banner: true,
      category_grid: true,
      featured_edits: true,
      why_jalyn: true,
      services_strip: true,
      promo_banner: true,
      new_arrivals: true,
      exclusive_sale: true,
      our_products: true,
      instagram_feed: true,
    },
  },
  mobile_homepage_layout: {
    order: [
      'hero_banner',
      'category_grid',
      'new_arrivals',
      'exclusive_sale',
      'our_products',
      'promo_banner',
      'why_jalyn',
      'services_strip',
      'instagram_feed',
    ],
    visibility: {
      hero_banner: true,
      category_grid: true,
      new_arrivals: true,
      exclusive_sale: true,
      our_products: true,
      promo_banner: true,
      why_jalyn: true,
      services_strip: true,
      instagram_feed: true,
    },
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
  page_new_arrivals: {
    title: 'New Arrivals',
    description: 'Discover the latest styles handpicked for you. From effortless everyday looks to statement pieces, our new arrivals are designed to keep you ahead in fashion.',
    bg_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
    slug: 'new-arrivals',
    meta_title: 'New Arrivals | JALYN Store',
    meta_description: 'Discover the latest women\'s fashion arrivals at JALYN. Shop new dresses, co-ord sets, ethnic wear, tops and more.'
  },
  page_sale: {
    title: 'Exclusive Sale',
    description: 'Upgrade your wardrobe with our curated seasonal markdowns. Enjoy premium quality JALYN styles at special limited-time pricing.',
    bg_image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80',
    slug: 'sale',
    meta_title: 'Seasonal Sale | JALYN Store',
    meta_description: 'Shop the JALYN clearance and seasonal sale. Enjoy massive discounts on premium dresses, tops, accessories, and coordinates.'
  },
  recently_viewed: {
    title: 'Recently Viewed',
    enabled: true
  },
  you_may_also_like: {
    title: 'You May Also Like',
    enabled: true
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
    const { url, storage } = await processAndStoreImage(req.file);
    const imageUrl = storage === 'local_multer' ? `/uploads${url.replace('/uploads', '')}` : url;
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
