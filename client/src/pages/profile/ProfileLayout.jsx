import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Tag,
  Bell,
  RotateCcw,
  HelpCircle,
  LogOut,
  Edit2,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { useUserStore } from '@/store'
import { cn } from '@/lib/utils'

export default function ProfileLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUserStore((s) => s.user)
  const logoutStore = useUserStore((s) => s.logout)
  const updateProfile = useUserStore((s) => s.updateProfile)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || (user?.name ? user.name.split(' ')[0] : ''),
    lastName: user?.lastName || (user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : ''),
    email: user?.email || '',
    phone: user?.phone || '',
  })

  const navItems = [
    { label: 'My Orders', href: '/profile/orders', icon: ShoppingBag, desc: 'Track and manage your order history' },
    { label: 'Wishlist', href: '/profile/wishlist', icon: Heart, desc: 'Your saved favorite fashion pieces' },
    { label: 'Addresses', href: '/profile/addresses', icon: MapPin, desc: 'Manage your saved delivery addresses' },
    { label: 'Help & Support', href: '/profile/help', icon: HelpCircle, desc: 'Contact stylists & FAQs' },
  ]

  const handleSaveProfile = (e) => {
    e.preventDefault()
    updateProfile(editForm)
    setIsEditModalOpen(false)
  }

  const handleLogout = () => {
    logoutStore()
    setIsLogoutModalOpen(false)
    navigate('/login')
  }

  const isRootProfilePage = location.pathname === '/profile' || location.pathname === '/account'

  const avatarInitial = (user?.firstName || user?.name || 'U').charAt(0).toUpperCase()

  // GUEST STATE / UNAUTHENTICATED PROFILE GATE VIEW
  if (!user) {
    return (
      <div className="min-h-[80vh] bg-[#FAF7F5] flex items-center justify-center p-6 font-body">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#EFE9E4] p-8 shadow-soft text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2C1C24] text-[#E8C5A8] shadow-md">
            <User className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-[#2C1C24]">
              Welcome to Jalyn Account
            </h2>
            <p className="text-xs text-[#666666] leading-relaxed">
              Sign in to view your orders, saved addresses, wishlist items, and exclusive member privileges.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
              className="w-full rounded-xl bg-[#2C1C24] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-[#3D2832] transition cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => navigate('/register', { state: { from: location.pathname } })}
              className="w-full rounded-xl border border-[#2C1C24] py-3.5 text-xs font-bold uppercase tracking-wider text-[#2C1C24] hover:bg-[#FAF7F5] transition cursor-pointer"
            >
              Create New Account
            </button>
          </div>

          <div className="pt-4 border-t border-[#EFE9E4] flex items-center justify-center gap-6 text-[11px] font-semibold text-[#888888]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#D4A373]" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-[#D4A373]" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen pb-20 lg:pb-16">
      {/* =========================================
          MOBILE PROFILE VIEW (< 1024px / lg)
         ========================================= */}
      <div className="block lg:hidden">
        {isRootProfilePage ? (
          <div className="p-4 space-y-5">
            {/* Mobile Profile Header Card */}
            <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-soft p-5 text-white shadow-soft relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-16 w-16 rounded-full border-2 border-white/40 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-white/25 font-display text-2xl font-bold text-white">
                      {avatarInitial}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-sm"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-light">
                    JALYN Member
                  </span>
                  <h2 className="text-xl font-bold truncate">Hello, {user.firstName}</h2>
                  <p className="text-[11px] text-white/80 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Mobile App Menu List */}
            <div className="rounded-2xl border border-primary/10 bg-white overflow-hidden shadow-sm divide-y divide-primary/5">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    className="flex items-center gap-3.5 px-4 py-3.5 active:bg-[#FAF8F8] transition"
                    style={{ minHeight: '52px' }}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFD7E3]/50 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#222222]">{item.label}</p>
                      <p className="text-[11px] text-[#666666] truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#666666]/60 shrink-0" />
                  </NavLink>
                )
              })}

              {/* Logout Item */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left active:bg-red-50 text-red-500 transition"
                style={{ minHeight: '52px' }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold">Logout</p>
                  <p className="text-[11px] text-red-400">Sign out of your JALYN account</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <Outlet />
          </div>
        )}
      </div>

      {/* =========================================
          DESKTOP PROFILE VIEW (>= 1024px / lg)
         ========================================= */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-12">
          {/* Luxury Profile Header Banner */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-soft p-6 sm:p-8 text-white shadow-lift">
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-20 w-20 rounded-full border-4 border-white/30 object-cover shadow-soft"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/25 font-display text-3xl font-bold text-white shadow-soft">
                      {avatarInitial}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-primary shadow-md hover:scale-110 transition"
                    aria-label="Edit avatar"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div>
                  <span className="font-label text-xs font-bold uppercase tracking-wider text-rose-light">
                    Welcome back to JALYN
                  </span>
                  <h1 className="font-display text-2xl font-bold sm:text-3xl">
                    Hello, {user.firstName} {user.lastName}
                  </h1>
                  <p className="mt-1 text-xs text-white/80">
                    {user.email} | {user.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white hover:text-primary"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* 2-Column Desktop Account Grid */}
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Account Sidebar Navigation */}
            <aside className="col-span-3">
              <div className="rounded-2xl border border-primary/10 bg-white p-3 shadow-soft sticky top-24">
                <h3 className="mb-2 px-3 pt-2 font-heading text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Navigation
                </h3>
                <nav className="space-y-1">
                  <NavLink
                    to="/profile"
                    end
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all',
                        isActive
                          ? 'bg-rose-light/50 text-primary shadow-sm border border-primary/10'
                          : 'text-ink-muted hover:bg-surface hover:text-ink',
                      )
                    }
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span>My Account</span>
                  </NavLink>

                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.label}
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold transition-all',
                            isActive
                              ? 'bg-rose-light/50 text-primary shadow-sm border border-primary/10'
                              : 'text-ink-muted hover:bg-surface hover:text-ink',
                          )
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}

                  <div className="pt-2 border-t border-primary/10 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Account Content Area */}
            <main className="col-span-9 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lift"
            >
              <div className="flex items-center justify-between border-b border-primary/10 px-6 py-4">
                <h3 className="font-heading text-lg font-semibold text-ink">Edit Profile</h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-muted hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-ink">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full rounded-xl border border-primary/15 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-ink">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full rounded-xl border border-primary/15 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-ink">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-primary/15 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-ink">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-primary/15 px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-primary/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-xl border border-primary/20 px-4 py-2 text-xs font-bold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-soft"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Bottom Sheet for Mobile / Modal for Desktop */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutModalOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-[101] rounded-t-[24px] bg-white p-6 shadow-lift text-center lg:hidden"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-primary/20" />
              <h3 className="text-base font-bold text-[#222222]">Logout Confirmation</h3>
              <p className="mt-1 text-xs text-[#666666]">Are you sure you want to sign out from JALYN?</p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 rounded-xl border border-[#E5D8DE] py-3 text-xs font-bold text-[#222222]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-xl bg-red-500 py-3 text-xs font-bold text-white shadow-sm"
                >
                  Logout
                </button>
              </div>
            </motion.div>

            {/* Desktop Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[101] m-auto hidden lg:flex h-fit w-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-lift text-center"
            >
              <h3 className="font-heading text-lg font-bold text-ink mb-2">Logout Confirmation</h3>
              <p className="text-xs text-ink-muted mb-6">
                Are you sure you want to logout from your JALYN account?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="rounded-xl border border-primary/20 px-5 py-2.5 text-xs font-bold text-ink hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
