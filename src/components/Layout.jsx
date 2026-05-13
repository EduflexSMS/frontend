import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../contexts/ThemeContext';
import logo from '../assets/logo.jpg';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg:         '#0a0c1b',
    sidebar:    '#0e1022',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    card:       'rgba(255,255,255,0.04)',
    glass:      'rgba(14,16,34,0.85)',
    border:     'rgba(255,255,255,0.07)',
    text:       '#eef0fc',
    muted:      '#4a5080',
    sub:        '#7880a8',
    activeText: '#ffffff',
    surface:    'rgba(255,255,255,0.03)',
    inputBg:    'rgba(255,255,255,0.05)',
  },
  light: {
    bg:         '#f4f6ff',
    sidebar:    '#ffffff',
    sidebarBorder: 'rgba(0,0,0,0.06)',
    card:       'rgba(255,255,255,0.9)',
    glass:      'rgba(255,255,255,0.88)',
    border:     'rgba(0,0,0,0.07)',
    text:       '#0f1130',
    muted:      '#b0b8d8',
    sub:        '#7880a8',
    activeText: '#ffffff',
    surface:    'rgba(0,0,0,0.02)',
    inputBg:    'rgba(0,0,0,0.04)',
  },
};

const A = {
  coral:   '#ff5c7c',
  indigo:  '#6c5fff',
  cyan:    '#00cfff',
  emerald: '#00d4a0',
  amber:   '#ffb84d',
  rose:    '#ff3d6b',
};

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/',             icon: HomeIcon,    label: 'Home'    },
  { path: '/students',     icon: UsersIcon,   label: 'Students'},
  { path: '/reports',      icon: ChartIcon,   label: 'Reports' },
  { path: '/pos',          icon: CartIcon,    label: 'POS'     },
  { path: '/daily-report', icon: CalIcon,     label: 'Daily'   },
];

const SIDEBAR_EXTRA = [
  { path: '/add-student',  icon: PlusIcon,    label: 'Add Student' },
  { path: '/add-subject',  icon: BookIcon,    label: 'Add Subject' },
  { path: '/qr-scanner',   icon: QrIcon,      label: 'QR Scanner'  },
];

// ─── SVG ICON COMPONENTS ──────────────────────────────────────────────────────
function HomeIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function UsersIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function ChartIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function CartIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57L23 6H6"/>
    </svg>
  );
}
function CalIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function PlusIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
function BookIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
}
function QrIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="17" y2="14"/>
      <line x1="20" y1="14" x2="20" y2="14"/><line x1="20" y1="17" x2="20" y2="17"/>
      <line x1="17" y1="20" x2="20" y2="20"/><line x1="14" y1="17" x2="14" y2="20"/>
    </svg>
  );
}
function GlobeIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>
  );
}
function MoonIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}
function SunIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function LogoutIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function MenuIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="16" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function CloseIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

// ─── SIDEBAR NAV ITEM ─────────────────────────────────────────────────────────
function SideNavItem({ item, active, onClick, theme, collapsed }) {
  const colors = T[theme];
  const IconComp = item.icon;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: active ? 0 : 3 }}
      whileTap={{ scale: 0.97 }}
      title={collapsed ? item.label : undefined}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 13,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '12px' : '11px 14px',
        borderRadius: 12,
        cursor: 'pointer',
        marginBottom: 2,
        border: 'none',
        outline: 'none',
        background: active
          ? `linear-gradient(135deg, ${A.coral}, ${A.rose})`
          : 'transparent',
        boxShadow: active ? `0 4px 18px rgba(255,92,124,0.3)` : 'none',
        transition: 'background 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
    >
      {/* Hover bg */}
      {!active && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 12,
          background: theme === 'dark'
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.04)',
          opacity: 0, transition: 'opacity 0.15s',
          pointerEvents: 'none',
        }} className="nav-hover-bg" />
      )}

      {/* Icon */}
      <span style={{
        color: active ? '#fff' : colors.sub,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.2s',
      }}>
        <IconComp size={17} color={active ? '#fff' : colors.sub} />
      </span>

      {/* Label */}
      {!collapsed && (
        <span style={{
          fontWeight: active ? 700 : 500,
          fontSize: 13.5,
          color: active ? '#fff' : colors.sub,
          letterSpacing: '-0.1px',
          transition: 'color 0.2s',
          whiteSpace: 'nowrap',
        }}>
          {item.label}
        </span>
      )}

      {/* Active dot */}
      {active && !collapsed && (
        <span style={{
          marginLeft: 'auto',
          width: 5, height: 5,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.6)',
          flexShrink: 0,
        }} />
      )}
    </motion.button>
  );
}

// ─── BOTTOM NAV ITEM ──────────────────────────────────────────────────────────
function BottomNavItem({ item, active, onClick, theme }) {
  const colors = T[theme];
  const IconComp = item.icon;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.87 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 4px 6px',
        position: 'relative',
      }}
    >
      {/* Active pill bg */}
      {active && (
        <motion.div
          layoutId="activeTabBg"
          style={{
            position: 'absolute',
            top: 6,
            width: 40,
            height: 40,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${A.coral}, ${A.rose})`,
            boxShadow: `0 6px 20px rgba(255,92,124,0.4)`,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}

      {/* Icon */}
      <span style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40, height: 40,
      }}>
        <IconComp
          size={18}
          color={active ? '#fff' : colors.muted}
        />
      </span>

      {/* Label */}
      <span style={{
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.4px',
        color: active ? A.coral : colors.muted,
        textTransform: 'uppercase',
        lineHeight: 1,
        transition: 'color 0.2s',
      }}>
        {item.label}
      </span>
    </motion.button>
  );
}

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { toggleColorMode, mode } = React.useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const theme = mode === 'dark' ? 'dark' : 'light';
  const colors = T[theme];

  useEffect(() => {
    const el = document.querySelector('.main-scroll-area');
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 10);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

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

  const pageTitle =
    [...NAV_ITEMS, ...SIDEBAR_EXTRA].find(i => isActive(i.path))?.label || 'EduFlex';

  // ── Sidebar inner content ──────────────────────────────────────────────────
  const SidebarInner = ({ collapsed = false }) => (
    <div style={{
      width: collapsed ? 72 : 256,
      height: '100%',
      background: colors.sidebar,
      display: 'flex',
      flexDirection: 'column',
      borderRight: `1px solid ${colors.sidebarBorder}`,
      transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
    }}>

      {/* ── Brand ── */}
      <div style={{
        padding: collapsed ? '26px 0' : '26px 20px 20px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          border: `2px solid ${A.coral}`,
          boxShadow: `0 0 18px rgba(255,92,124,0.3)`,
        }}>
          <img
            src={logo}
            alt="logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {!collapsed && (
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: 17,
              color: colors.text,
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              fontFamily: "'Outfit', sans-serif",
            }}>EDUFLEX</div>
            <div style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '2.5px',
              color: A.coral,
              textTransform: 'uppercase',
            }}>Institute</div>
          </div>
        )}
      </div>

      {/* ── Nav items ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: collapsed ? '16px 8px' : '16px 12px',
      }}>
        {/* Section label */}
        {!collapsed && (
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '2px',
            color: colors.muted,
            textTransform: 'uppercase',
            padding: '0 6px',
            marginBottom: 10,
          }}>Menu</div>
        )}

        {NAV_ITEMS.map(item => (
          <SideNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            onClick={() => handleNav(item.path)}
            theme={theme}
            collapsed={collapsed}
          />
        ))}

        {/* Divider */}
        <div style={{
          height: 1,
          background: colors.border,
          margin: '14px 6px',
        }} />

        {!collapsed && (
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '2px',
            color: colors.muted,
            textTransform: 'uppercase',
            padding: '0 6px',
            marginBottom: 10,
          }}>Manage</div>
        )}

        {SIDEBAR_EXTRA.map(item => (
          <SideNavItem
            key={item.path}
            item={item}
            active={isActive(item.path)}
            onClick={() => handleNav(item.path)}
            theme={theme}
            collapsed={collapsed}
          />
        ))}

        {/* Divider */}
        <div style={{
          height: 1,
          background: colors.border,
          margin: '14px 6px',
        }} />

        {!collapsed && (
          <div style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: '2px',
            color: colors.muted,
            textTransform: 'uppercase',
            padding: '0 6px',
            marginBottom: 10,
          }}>Settings</div>
        )}

        {/* Language */}
        <motion.button
          whileHover={{ x: collapsed ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'si' : 'en')}
          title={collapsed ? 'Language' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 13,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '11px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            marginBottom: 2,
            background: 'transparent',
            border: 'none',
            outline: 'none',
          }}
        >
          <GlobeIcon size={17} color={colors.sub} />
          {!collapsed && (
            <span style={{ fontWeight: 500, fontSize: 13.5, color: colors.sub }}>
              {i18n.language === 'si' ? 'සිංහල' : 'English'}
            </span>
          )}
        </motion.button>

        {/* Theme */}
        <motion.button
          whileHover={{ x: collapsed ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={toggleColorMode}
          title={collapsed ? (mode === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 13,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '11px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            outline: 'none',
          }}
        >
          {mode === 'dark'
            ? <SunIcon size={17} color={colors.sub} />
            : <MoonIcon size={17} color={colors.sub} />
          }
          {!collapsed && (
            <span style={{ fontWeight: 500, fontSize: 13.5, color: colors.sub }}>
              {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </motion.button>
      </div>

      {/* ── Logout ── */}
      <div style={{
        padding: collapsed ? '12px 8px 20px' : '12px 12px 20px',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <motion.button
          whileHover={{ x: collapsed ? 0 : 3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 13,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '11px 14px',
            borderRadius: 12,
            cursor: 'pointer',
            background: 'rgba(255,92,124,0.07)',
            border: '1px solid rgba(255,92,124,0.12)',
            outline: 'none',
            transition: 'background 0.2s',
          }}
        >
          <LogoutIcon size={17} color={A.coral} />
          {!collapsed && (
            <span style={{ fontWeight: 600, fontSize: 13.5, color: A.coral }}>
              {t('logout')}
            </span>
          )}
        </motion.button>

        {!collapsed && (
          <div style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: 9.5,
            color: colors.muted,
            letterSpacing: '1.5px',
          }}>
            EDUFLEX v2.5 • 2026
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: colors.bg,
      fontFamily: "'Outfit', 'Inter', sans-serif",
      color: colors.text,
      transition: 'background 0.35s, color 0.35s',
    }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="desktop-sidebar" style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        display: 'none',
      }}>
        <SidebarInner collapsed={sidebarCollapsed} />

        {/* Collapse toggle */}
        <motion.button
          onClick={() => setSidebarCollapsed(p => !p)}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'absolute',
            top: 78,
            right: -13,
            width: 26, height: 26,
            borderRadius: '50%',
            background: colors.sidebar,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.1)`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            zIndex: 10,
          }}
        >
          <svg
            width={12} height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.sub}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>
      </div>

      {/* ── MOBILE OVERLAY SIDEBAR ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 200,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
              }}
            />
            <motion.div
              key="drawer"
              initial={{ x: -270 }}
              animate={{ x: 0 }}
              exit={{ x: -270 }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 201,
              }}
            >
              <SidebarInner collapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── RIGHT SIDE (header + content) ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}>

        {/* ── TOP HEADER ── */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: colors.glass,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${scrolled ? colors.border : 'transparent'}`,
          padding: '0 20px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: scrolled ? `0 2px 20px rgba(0,0,0,0.07)` : 'none',
        }}>

          {/* Hamburger (mobile only) */}
          <motion.button
            className="mobile-menu-btn"
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(true)}
            style={{
              width: 38, height: 38,
              borderRadius: 11,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              flexShrink: 0,
            }}
          >
            <MenuIcon size={18} color={colors.text} />
          </motion.button>

          {/* Page title */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pageTitle}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <div style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color: colors.text,
                  letterSpacing: '-0.3px',
                  lineHeight: 1.2,
                }}>
                  {pageTitle}
                </div>
                <div style={{
                  fontSize: 10.5,
                  color: colors.muted,
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                }}>
                  Institute Management
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <motion.div
            whileTap={{ scale: 0.92 }}
            style={{
              width: 38, height: 38,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${A.coral} 0%, ${A.indigo} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              color: '#fff',
              cursor: 'pointer',
              boxShadow: `0 4px 14px rgba(255,92,124,0.4)`,
              flexShrink: 0,
              letterSpacing: '-0.5px',
            }}
          >
            A
          </motion.div>
        </div>

        {/* ── PAGE CONTENT ── */}
        <div
          className="main-scroll-area"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '22px 18px 100px',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── BOTTOM NAV (mobile only) ── */}
      <div
        className="bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 150,
          background: colors.glass,
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'stretch',
          padding: '4px 6px 8px',
          boxShadow: `0 -2px 24px rgba(0,0,0,0.1)`,
        }}
      >
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

      {/* ── Global CSS ── */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-sidebar { display: block !important; position: sticky !important; }
          .mobile-menu-btn { display: none !important; }
          .bottom-nav { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-sidebar { display: none !important; }
        }
        .nav-hover-bg:hover { opacity: 1 !important; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,92,124,0.25);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-track { background: transparent; }
        button { outline: none; }
      `}</style>
    </div>
  );
}