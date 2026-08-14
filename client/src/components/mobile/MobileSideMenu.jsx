import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import logo from '@/assets/jalyn-logo.png'
import { NAV_LINKS } from '@/constants/data'
import { useUIStore } from '@/store'
import { useCmsData } from '@/hooks/useCmsData'
import { cn } from '@/lib/utils'

export default function MobileSideMenu() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const { menuLinks } = useCmsData()
  const navLinks = menuLinks?.length ? menuLinks : NAV_LINKS

  const [expandedMenu, setExpandedMenu] = useState(null)

  const toggleExpand = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label)
  }

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-[60] bg-[#2A1A22]/35 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 left-0 z-[70] flex w-[82%] max-w-xs flex-col bg-[#FFF6F9] border-r border-[#EFD7E3] shadow-lift lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between border-b border-[#EFD7E3] px-4 py-4">
              <img src={logo} alt="JALYN" className="h-9 w-auto" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#AD4A85] hover:bg-rose-blush/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const hasGroups = Boolean(link.groups && link.groups.length > 0)
                const hasChildren = Boolean(link.children && link.children.length > 0)
                const isExpanded = expandedMenu === link.label

                if (hasGroups || hasChildren) {
                  return (
                    <div key={link.label} className="border-b border-[#EFD7E3]/60 pb-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(link.label)}
                        className="flex w-full items-center justify-between py-2.5 text-xs font-bold uppercase tracking-wider text-[#2A1A22] hover:text-[#AD4A85] cursor-pointer"
                      >
                        <span>{link.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-[#AD4A85]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#AD4A85]/70" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 pl-2 space-y-4">
                          {/* If it has multi-column mega menu groups */}
                          {hasGroups &&
                            link.groups.map((group) => (
                              <div key={group.title} className="space-y-2">
                                <span className="block text-[10px] font-bold uppercase text-[#AD4A85] tracking-[0.12em]">
                                  {group.title}
                                </span>
                                <div className="space-y-1 pl-2 border-l border-[#EFD7E3] ml-1">
                                  {group.items?.map((item) => (
                                    <Link
                                      key={item.label}
                                      to={item.href}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block py-1.5 text-xs text-[#7A5A6A] hover:text-[#AD4A85] font-medium transition"
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}

                          {/* If it has standard single list children */}
                          {hasChildren &&
                            link.children.map((child) => (
                              <Link
                                key={child.label}
                                to={child.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1.5 text-xs text-[#7A5A6A] hover:text-[#AD4A85] font-semibold transition"
                              >
                                {child.label}
                              </Link>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-xs font-bold uppercase tracking-wider text-[#2A1A22] hover:text-[#AD4A85] border-b border-[#EFD7E3]/60"
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
