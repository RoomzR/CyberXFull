import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User, LogOut, LogIn, Gamepad2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { springManifest } from '../lib/motion';
import { useActiveSection } from '../hooks/useActiveSection';
import { useAuth } from '../hooks/useAuth';
import { useIsManager } from '../hooks/useRole';
import { LanguageSwitcher } from './LanguageSwitcher';

const links = [
  { key: 'home',         href: '#home',         id: 'home' },
  { key: 'about',        href: '#about',        id: 'about' },
  { key: 'tariffs',      href: '#tariffs',      id: 'tariffs' },
  { key: 'advantages',   href: '#advantages',   id: 'advantages' },
  { key: 'stats',        href: '#stats',        id: 'stats' },
  { key: 'tournaments',  href: '#tournaments',  id: 'tournaments' },
  { key: 'events',       href: '#events',       id: 'events' },
  { key: 'teams',        href: '#teams',        id: 'teams' },
  { key: 'faq',          href: '#faq',          id: 'faq' },
  { key: 'contact',      href: '#contact',      id: 'contact' },
] as const;

const overlayContainer = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

const overlayLink = {
  hidden:  { opacity: 0, y: 40, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springManifest },
};

interface NavLinkProps {
  href:     string;
  active:   boolean;
  children: ReactNode;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

function NavLink({ href, active, children, onClick, variant = 'desktop' }: NavLinkProps) {
  const className = [
    variant === 'mobile' ? 'site-menu-overlay__link' : 'site-nav__link',
    active ? 'site-nav__link--active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

export function Header() {
  const { t }                        = useTranslation();
  const active                       = useActiveSection(links.map(l => l.id));
  const [menuOpen, setMenuOpen]      = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const isManager                    = useIsManager();
  const navigate                     = useNavigate();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={springManifest}
        className="site-header"
      >
        <div className="site-header__beam" aria-hidden />
        <div className="site-header__inner">
          <a href="#home" className="site-logo">
            <span className="site-logo__cyber">CYBER</span>
            <span className="site-logo__x">X</span>
          </a>

          <nav className="site-nav" aria-label="Main">
            {links.map(link => (
              <NavLink key={link.key} href={link.href} active={active === link.id}>
                {t(`nav.${link.key}`)}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            {/* 3D Tour link */}
            <Link
              to="/live"
              className="site-nav__link hidden md:flex items-center gap-1.5 text-xs text-[#ff5500]/80 hover:text-[#ff5500]"
              title="Live CS2 Stats"
            >
              LIVE
            </Link>
            <Link
              to="/3d-club"
              className="site-nav__link hidden md:flex items-center gap-1.5 text-xs"
              title="Виртуальный тур"
            >
              <Gamepad2 size={14} strokeWidth={1.5} />
              <span>3D Тур</span>
            </Link>

            <LanguageSwitcher />

            {/* Auth actions */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                {isManager && (
                  <Link
                    to="/admin/tournaments"
                    className="site-nav__link text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    Админ
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 site-nav__link text-xs"
                  title={user?.username}
                >
                  <User size={14} strokeWidth={1.5} />
                  <span className="max-w-[80px] truncate">{user?.username}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 site-nav__link text-xs text-cyber-muted hover:text-cyber-primary"
                  title="Выйти"
                >
                  <LogOut size={13} strokeWidth={1.5} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-1.5 site-nav__link text-xs"
              >
                <LogIn size={14} strokeWidth={1.5} />
                <span>Войти</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="site-header__menu-btn"
              aria-label="Open menu"
            >
              <Menu size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="site-menu-overlay"
          >
            <div className="site-menu-overlay__ambient" aria-hidden />

            <button
              type="button"
              onClick={closeMenu}
              className="site-menu-overlay__close"
              aria-label="Close menu"
            >
              <X size={16} strokeWidth={1.5} />
            </button>

            <motion.nav
              variants={overlayContainer}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="site-menu-overlay__nav"
              aria-label="Mobile"
            >
              {links.map(link => (
                <motion.div key={link.key} variants={overlayLink}>
                  <NavLink
                    href={link.href}
                    active={active === link.id}
                    onClick={closeMenu}
                    variant="mobile"
                  >
                    {t(`nav.${link.key}`)}
                  </NavLink>
                </motion.div>
              ))}

              {/* Mobile extra links */}
              <motion.div variants={overlayLink}>
                <Link
                  to="/live"
                  onClick={closeMenu}
                  className="site-menu-overlay__link text-[#ff5500]"
                >
                  LIVE Stats
                </Link>
              </motion.div>
              <motion.div variants={overlayLink}>
                <Link
                  to="/3d-club"
                  onClick={closeMenu}
                  className="site-menu-overlay__link flex items-center gap-2"
                >
                  <Gamepad2 size={16} strokeWidth={1.5} />
                  3D Тур
                </Link>
              </motion.div>

              {isAuthenticated ? (
                <>
                  <motion.div variants={overlayLink}>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className="site-menu-overlay__link flex items-center gap-2"
                    >
                      <User size={16} strokeWidth={1.5} />
                      {user?.username}
                    </Link>
                  </motion.div>
                  <motion.div variants={overlayLink}>
                    <button
                      type="button"
                      onClick={() => { closeMenu(); void handleLogout(); }}
                      className="site-menu-overlay__link flex items-center gap-2 w-full text-left"
                    >
                      <LogOut size={16} strokeWidth={1.5} />
                      Выйти
                    </button>
                  </motion.div>
                </>
              ) : (
                <motion.div variants={overlayLink}>
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="site-menu-overlay__link flex items-center gap-2"
                  >
                    <LogIn size={16} strokeWidth={1.5} />
                    Войти
                  </Link>
                </motion.div>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
