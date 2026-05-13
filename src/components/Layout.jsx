import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../contexts/ThemeContext';
import logo from '../assets/logo.jpg';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const NAV = {
  dark: {
    bg: '#12152e',
    sidebar: '#0d1025',
    card: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.08)',
    text: '#f0f0f8',
    sub: '#7b82a8',
    active: '#ff6584',
    activeGlow: 'rgba(255,101,132,0.35)',
    bottomBar: 'rgba(13,16,37,0.92)',
  },
  light: {
    bg: '#f0f2ff',
    sidebar: '#ffffff',
    card: 'rgba(255,255,255,0.85)',
    border: 'rgba(0,0,0,0.07)',
    text: '#1a1d3a',
    sub: '#8890b5',
    active: '#ff6584',
    activeGlow: 'rgba(255,101,132,0.25)',
    bottomBar: 'rgba(255,255,255,0.95)',
  },
};

const ACCENT = {
  coral:   '#ff6584',
  indigo:  '#6c63ff',
  cyan:    '#00d4ff',
  emerald: '#00c896',
  amber:   '#ffb547',
  navy:    '#1a2050',
};

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/',            icon: '🏠', label: 'Home' },
  { path: '/students',    icon: '👥', label: 'Students' },
  { path: '/reports',     icon: '📊', label: 'Reports' },
  { path: '/pos',         icon: '🛒', label: 'POS' },
  { path: '/daily-report',icon: '📅', label: 'Daily' },
];

const SIDEBAR_EXTRA = [
  { path: '/add-student', icon: '➕', label: 'Add Student' },
  { path: '/add-subject', icon: '📚', label: 'Add Subject' },
  { path: '/qr-scanner',  icon: '📷', label: 'QR Scan' },
];

// ─── BOTTOM NAV ITEM ──────────────────────────────────────────────────────────
const BottomNavItem = ({ item, active, onClick, theme }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.88 }}
    style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 4, background: 'none', border: 'none',
      cursor: 'pointer', padding: '8px 4px', position: 'relative',
    }}
  >
    {active && (
      <motion.div
        layoutId="bottomNavPill"
        style={{
          position: 'absolute', top: 4,
          width: 44, height: 44, borderRadius: '50%',
          background: ACCENT.coral,
          boxShadow: `0 6px 20px ${NAV[theme].activeGlow}`,
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    )}
    <span style={{
      fontSize: 20, position: 'relative', zIndex: 1,
      filter: active ? 'brightness(10)' : 'none',
      transition: 'filter 0.2s',
    }}>{item.icon}</span>
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.5px',
      color: active ? ACCENT.coral : NAV[theme].sub,
      textTransform: 'uppercase', transition: 'color 0.2s',
    }}>{item.label}</span>
  </motion.button>
);

// ─── SIDEBAR NAV ITEM ─────────────────────────────────────────────────────────
const SideNavItem = ({ item, active, onClick, theme }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ x: 6 }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '13px 18px', borderRadius: 16, cursor: 'pointer',
      marginBottom: 4,
      background: active
        ? `linear-gradient(135deg, ${ACCENT.coral}, #ff8fa3)`
        : 'transparent',
      boxShadow: active ? `0 8px 24px ${NAV[theme].activeGlow}` : 'none',
      transition: 'background 0.3s, box-shadow 0.3s',
      position: 'relative', overflow: 'hidden',
    }}
  >
    {!active && (
      <motion.div
        whileHover={{ opacity: 1 }}
        style={{
          position: 'absolute', inset: 0,
          background: `rgba(255,101,132,0.06)`, borderRadius: 16,
          opacity: 0, transition: 'opacity 0.2s',
        }}
      />
    )}
    <span style={{
      fontSize: 18, width: 24, textAlign: 'center',
      filter: active ? 'brightness(10)' : 'none',
    }}>{item.icon}</span>
    <span style={{
      fontWeight: active ? 800 : 600, fontSize: 14,
      color: active ? '#fff' : NAV[theme].sub,
      letterSpacing: '-0.2px', transition: 'color 0.2s',
    }}>{item.label}</span>
    {active && (
      <span style={{
        marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
      }} />
    )}
  </motion.div>
);

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { toggleColorMode, mode } = React.useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const theme = mode === 'dark' ? 'dark' : 'light';
  const T = NAV[theme];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userInfo');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // ── Sidebar content ────────────────────────────────────────────────────────
  const sidebarContent = (
    <div style={{
      width: 270, height: '100%', background: T.sidebar,
      display: 'flex', flexDirection: 'column',
      borderRight: `1px solid ${T.border}`,
      boxShadow: '4px 0 32px rgba(0,0,0,0.15)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '32px 24px 20px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <img src={logo} alt="logo" style={{
          width: 46, height: 46, borderRadius: '50%',
          objectFit: 'cover',
          boxShadow: `0 0 20px ${ACCENT.coral}55`,
          border: `2px solid ${ACCENT.coral}`,
        }} />
        <div>
          <div style={{
            fontWeight: 900, fontSize: 18, letterSpacing: '-0.5px',
            color: T.text, fontFamily: "'Outfit', sans-serif",
          }}>EDUFLEX</div>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '2.5px',
            color: ACCENT.coral, textTransform: 'uppercase',
          }}>Institute</div>
        </div>
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 12px' }}>
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '2px',
          color: T.sub, textTransform: 'uppercase',
          padding: '0 6px', marginBottom: 12,
        }}>Main Menu</div>

        {[...NAV_ITEMS, ...SIDEBAR_EXTRA].map(item => (
          <SideNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            onClick={() => handleNav(item.path)}
            theme={theme}
          />
        ))}

        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '2px',
          color: T.sub, textTransform: 'uppercase',
          padding: '0 6px', margin: '20px 0 12px',
        }}>Settings</div>

        {/* Language toggle */}
        <motion.div
          whileHover={{ x: 6 }} whileTap={{ scale: 0.97 }}
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 18px', borderRadius: 16, cursor: 'pointer',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 18 }}>🌐</span>
          <span style={{ fontWeight: 600, fontSize: 14, color: T.sub }}>
            {i18n.language === 'si' ? 'සිංහල' : 'English'}
          </span>
        </motion.div>

        {/* Theme toggle */}
        <motion.div
          whileHover={{ x: 6 }} whileTap={{ scale: 0.97 }}
          onClick={toggleColorMode}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 18px', borderRadius: 16, cursor: 'pointer',
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 18 }}>{mode === 'dark' ? '☀️' : '🌙'}</span>
          <span style={{ fontWeight: 600, fontSize: 14, color: T.sub }}>
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </motion.div>
      </div>

      {/* Logout */}
      <div style={{ padding: '16px 12px 24px', borderTop: `1px solid ${T.border}` }}>
        <motion.div
          whileHover={{ x: 6 }} whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 18px', borderRadius: 16, cursor: 'pointer',
            background: 'rgba(255,101,132,0.08)',
            border: '1px solid rgba(255,101,132,0.15)',
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: ACCENT.coral }}>
            {t('logout')}
          </span>
        </motion.div>
        <div style={{
          textAlign: 'center', marginTop: 16,
          fontSize: 10, color: T.sub, letterSpacing: '1.5px',
        }}>EDUFLEX v2.5 • 2026</div>
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: T.bg, fontFamily: "'Outfit', 'Inter', sans-serif",
      color: T.text, transition: 'background 0.4s, color 0.4s',
      position: 'relative',
    }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <div style={{ display: 'none' }} className="desktop-sidebar">
        {sidebarContent}
      </div>

      {/* ── MOBILE OVERLAY ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              key="drawer"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minHeight: '100vh', overflowX: 'hidden',
        paddingBottom: 80, // space for bottom nav
      }}>

        {/* ── TOP HEADER ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: T.bottomBar,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '14px 20px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              border: `1px solid ${T.border}`,
              background: T.card,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 5, cursor: 'pointer',
            }}
          >
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: i === 1 ? 14 : 20, height: 2,
                background: T.text, borderRadius: 2,
                transition: 'width 0.2s',
              }} />
            ))}
          </motion.button>

          {/* Title */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontWeight: 900, fontSize: 16, letterSpacing: '-0.3px',
              color: T.text,
            }}>
              {NAV_ITEMS.find(i => isActive(i.path))?.label ||
               SIDEBAR_EXTRA.find(i => isActive(i.path))?.label ||
               'EduFlex'}
            </div>
            <div style={{ fontSize: 10, color: T.sub, fontWeight: 600 }}>
              Institute Management
            </div>
          </div>

          {/* Avatar */}
          <motion.div
            whileTap={{ scale: 0.92 }}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `linear-gradient(135deg, ${ACCENT.coral}, ${ACCENT.indigo})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 16, color: '#fff', cursor: 'pointer',
              boxShadow: `0 4px 14px ${ACCENT.coral}55`,
            }}
          >A</motion.div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div style={{ flex: 1, padding: '20px 16px', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM NAV BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 150,
        background: T.bottomBar,
        backdropFilter: 'blur(24px)',
        borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center',
        padding: '6px 8px 10px',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
      }}>
        {NAV_ITEMS.map(item => (
          <BottomNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            onClick={() => handleNav(item.path)}
            theme={theme}
          />
        ))}
      </div>

      {/* Desktop sidebar CSS override */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-sidebar { display: block !important; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
