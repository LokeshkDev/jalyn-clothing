import { useEffect } from 'react'

const BASE_URL = 'https://jalyn.in'
const DEFAULT_TITLE = 'JALYN — Luxury Women\'s Fashion, Silk Dresses, Co-ords & Ethnic Wear'
const DEFAULT_DESCRIPTION = 'Explore JALYN\'s luxury women\'s fashion collection featuring handcrafted silk midi dresses, contemporary co-ord sets, designer sarees, and modern ethnic wear. Fast shipping across India.'
const DEFAULT_IMAGE = `${BASE_URL}/images/home/hero/hero-slide-1.webp`

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  preloadImage,
  preloadImages,
  type = 'website',
  schema,
  price,
  currency = 'INR',
}) {
  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title ? `${title} | JALYN` : DEFAULT_TITLE
    document.title = formattedTitle

    // Helper to create or update meta tags
    const setMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        const [attrName, attrVal] = selector.replace(/[\[\]]/g, '').split('=')
        element.setAttribute(attrName, attrVal.replace(/['"]/g, ''))
        document.head.appendChild(element)
      }
      element.setAttribute(attribute, value)
    }

    // Helper to set link tags (e.g. canonical)
    const setLinkTag = (rel, href) => {
      let element = document.querySelector(`link[rel="${rel}"]`)
      if (!element) {
        element = document.createElement('link')
        element.setAttribute('rel', rel)
        document.head.appendChild(element)
      }
      element.setAttribute('href', href)
    }

    // 2. Standard Meta
    setMetaTag('meta[name="description"]', 'content', description)
    if (canonical) {
      const fullCanonical = canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`
      setLinkTag('canonical', fullCanonical)
    }

    // 3. Open Graph
    setMetaTag('meta[property="og:title"]', 'content', formattedTitle)
    setMetaTag('meta[property="og:description"]', 'content', description)
    setMetaTag('meta[property="og:type"]', 'content', type)
    setMetaTag('meta[property="og:site_name"]', 'content', 'JALYN')
    setMetaTag('meta[property="og:image"]', 'content', image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`)
    if (canonical) {
      setMetaTag('meta[property="og:url"]', 'content', canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
    }
    if (price) {
      setMetaTag('meta[property="og:price:amount"]', 'content', String(price))
      setMetaTag('meta[property="og:price:currency"]', 'content', currency)
    }

    // 4. Twitter Card
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image')
    setMetaTag('meta[name="twitter:title"]', 'content', formattedTitle)
    setMetaTag('meta[name="twitter:description"]', 'content', description)
    setMetaTag('meta[name="twitter:image"]', 'content', image.startsWith('http') ? image : `${BASE_URL}${image.startsWith('/') ? '' : '/'}${image}`)

    // 5. Preload LCP Images (Dynamic High-Priority Preload for instant discovery)
    const imagesToPreload = []
    if (preloadImage) {
      imagesToPreload.push(preloadImage)
    }
    if (Array.isArray(preloadImages)) {
      imagesToPreload.push(...preloadImages)
    }

    const createdPreloadLinks = []
    imagesToPreload.forEach((imgUrl) => {
      if (imgUrl && typeof imgUrl === 'string') {
        const fullUrl = imgUrl.startsWith('http') ? imgUrl : imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`
        let existing = document.querySelector(`link[rel="preload"][as="image"][href="${CSS.escape(fullUrl)}"]`)
        if (!existing) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = fullUrl
          link.fetchPriority = 'high'
          link.setAttribute('data-dynamic-preload', 'true')
          document.head.appendChild(link)
          createdPreloadLinks.push(link)
        }
      }
    })

    // 6. JSON-LD Structured Data Schema
    let scriptTag = document.getElementById('seo-jsonld-schema')
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script')
        scriptTag.id = 'seo-jsonld-schema'
        scriptTag.type = 'application/ld+json'
        document.head.appendChild(scriptTag)
      }
      scriptTag.textContent = JSON.stringify(schema)
    } else if (scriptTag) {
      scriptTag.remove()
    }

    return () => {
      // Clean up dynamic preloads on navigation if needed
    }
  }, [title, description, canonical, image, preloadImage, preloadImages, type, schema, price, currency])

  return null
}
