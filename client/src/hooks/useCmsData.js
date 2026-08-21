import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { HERO_SLIDES, COLLECTIONS, NAV_LINKS, FOOTER_LINKS, SERVICES, INSTAGRAM_POSTS } from '../constants/data';

async function fetchCmsHomepage() {
  try {
    const response = await api.get('/cms/homepage');
    return response.data?.data || null;
  } catch (err) {
    console.warn('Failed to load live CMS data, using static presets:', err);
    return null;
  }
}

export function useCmsData() {
  const { data: cmsData = null, isLoading: loading } = useQuery({
    queryKey: ['cms', 'homepage'],
    queryFn: fetchCmsHomepage,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // --- Hero Slides ---
  const heroSlides = cmsData?.hero_banner?.slides?.length
    ? cmsData.hero_banner.slides
    : (cmsData?.hero_banner?.banner_image || cmsData?.hero_banner?.heading !== undefined)
      ? [
          {
            id: 'cms-hero-1',
            image: cmsData.hero_banner.banner_image || HERO_SLIDES[0].image,
            alt: cmsData.hero_banner.heading || HERO_SLIDES[0].alt,
            eyebrow: cmsData.hero_banner.eyebrow ?? '',
            title: cmsData.hero_banner.heading ?? '',
            highlight: cmsData.hero_banner.highlight ?? '',
            subtitle: cmsData.hero_banner.subheading ?? '',
            cta: cmsData.hero_banner.cta_text ?? '',
            href: cmsData.hero_banner.cta_link || '/shop',
          },
        ]
      : HERO_SLIDES;

  // --- Category Grid ---
  const categoriesGrid = cmsData?.category_grid?.categories?.length
    ? cmsData.category_grid.categories.map((c, i) => ({
        id: c.id || c.slug || `cat-${i}`,
        title: c.title,
        slug: c.slug,
        subtitle: c.subtitle || `${20 + i * 4} items`,
        image: c.image,
        href: `/collections/${c.slug}`,
      }))
    : COLLECTIONS;

  // --- Why Jalyn / Brand Values ---
  const whyJalyn = cmsData?.why_jalyn || null;

  // --- Services / Promises Strip ---
  const servicesStrip = cmsData?.services_strip?.promises?.length
    ? cmsData.services_strip.promises
    : SERVICES;

  // --- Instagram Feed ---
  const instagramFeed = cmsData?.instagram_feed || {
    handle: '@jalyn.apparels',
    url: 'https://www.instagram.com/jalyn.apparels/',
    posts: INSTAGRAM_POSTS,
  };

  // --- Header Navigation Menu ---
  const menuLinks = cmsData?.menu_arrangement?.nav_links?.length
    ? cmsData.menu_arrangement.nav_links
    : NAV_LINKS;

  // --- Footer Settings (columns, social links, about text) ---
  const defaultFooterColumns = [
    { title: '', links: FOOTER_LINKS.column1 },
    { title: '', links: FOOTER_LINKS.column2 },
    { title: '', links: FOOTER_LINKS.column3 },
  ];

  const footerSettings = cmsData?.footer_settings || {
    instagram_link: 'https://www.instagram.com/jalyn.apparels/',
    facebook_link: '',
    columns: defaultFooterColumns,
  };

  const aboutPage = cmsData?.about_page || null;
  const contactPage = cmsData?.contact_page || null;
  const helpSupportPage = cmsData?.help_support_page || null;
  const authPage = cmsData?.auth_page || null;
  const policyPages = cmsData?.policy_pages || null;
  const codSettings = cmsData?.cod_settings || {
    enabled: true,
    min_order_amount: 0,
    cod_fee: 0,
    notice: 'Pay cash upon delivery at your doorstep.',
  };
  const deliverySettings = cmsData?.delivery_settings || {
    enabled: true,
    show_pincode_checker: true,
    shipping_notice: 'Free Express Delivery on orders above ₹1,999',
  };
  const taxSettings = cmsData?.tax_settings || {
    enabled: true,
    tax_percent: 18,
    tax_label: 'GST (18%)',
    inclusive: false,
  };
  const shippingMethods = cmsData?.shipping_methods || {
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
  };

  return {
    cmsData,
    heroSlides,
    categoriesGrid,
    whyJalyn,
    servicesStrip,
    instagramFeed,
    menuLinks,
    footerSettings,
    aboutPage,
    contactPage,
    helpSupportPage,
    authPage,
    policyPages,
    codSettings,
    deliverySettings,
    taxSettings,
    shippingMethods,
    announcementBar: cmsData?.announcement_bar || null,
    promoBanner: cmsData?.promo_banner || null,
    loading,
  };
}
