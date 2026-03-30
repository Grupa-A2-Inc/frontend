'use client';
import { useState, useEffect } from 'react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

const primaryNavItems = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard/admin' },
  { icon: 'book', label: 'Courses', href: '/dashboard/admin/courses' },
  { icon: 'calendar_today', label: 'Calendar', href: '/dashboard/admin/calendar' },
  { icon: 'group', label: 'Classes', href: '/dashboard/admin/classes' },
  { icon: 'assignment_late', label: 'Tests', href: '/dashboard/admin/tests' },
  { icon: 'star', label: 'Bookmarks', href: '/dashboard/admin/bookmarks' },
  { icon: 'settings', label: 'Settings', href: '/dashboard/admin/settings' },
];

interface NavItemProps {
  icon: string;
  label: string;
  href: string;
  collapsed: boolean;
}

function NavItem({ icon, label, href, collapsed }: NavItemProps) {
  return (
    <li className={styles.navItem}>
      <Link
        href={href}
        className={styles.navLink}
        style={collapsed
          ? { justifyContent: 'center', padding: '12px' }
          : { justifyContent: 'flex-start', padding: '12px 15px' }
        }
      >
        <span className={`${styles.navIcon} material-symbols-rounded ${collapsed ? 'width-[100%]' : ''}`}>
          {icon}
        </span>
        <span className={`${styles.navLabel} ${collapsed ? styles.navLabelHidden : ''}`}>
          {label}
        </span>
      </Link>
      {collapsed && <span className={styles.navTooltip}>{label}</span>}
    </li>
  );
}

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('sidebarCollapsed');
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
        localStorage.setItem('sidebarCollapsed', 'true');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = collapsed ? 80 : 260;

  return (
    <div style={{ display: 'flex' }}>
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <header className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <Image
              src="/my_logo.png"
              alt="TestifyAI"
              width={32}
              height={32}
              style={{ flexShrink: 0 }}
            />
            <span className={`${styles.logoText} ${collapsed ? styles.navLabelHidden : ''}`}>
              Testify<strong>AI</strong>
            </span>
          </div>
          <button className={styles.sidebarToggler} onClick={toggleSidebar}>
            <span className="material-symbols-rounded">chevron_left</span>
          </button>
        </header>

        {/* Nav */}
        <nav className={styles.sidebarNav}>
          <ul className={styles.navList}>
            {primaryNavItems.map((item) => (
              <NavItem key={item.label} {...item} collapsed={collapsed} />
            ))}
          </ul>

          {/* Footer: user + logout */}
          <div className={styles.sidebarFooter}>
            {!collapsed ? (
              <Link href="/dashboard/admin/profile" className={styles.userInfo}>
                <div className={styles.userAvatar}>J</div>
                <div className={styles.userDetails}>
                  <span className={styles.userName}>John Doe</span>
                  <span className={styles.userEmail}>john@example.com</span>
                </div>
              </Link>
            ) : (
              <Link href="/dashboard/admin/profile" style={{ display: 'flex', justifyContent: 'center' }}>
                <div className={styles.userAvatarCollapsed}>J</div>
              </Link>
            )}

            <div className={styles.logoutWrapper}>
              <button
                onClick={handleLogout}
                className={styles.logoutBtn}
                style={collapsed ? { justifyContent: 'center', padding: '10px', width: '100%' } : {}}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '1.2rem' }}>logout</span>
                <span className={`${styles.navLabel} ${collapsed ? styles.navLabelHidden : ''}`}>
                  Log Out
                </span>
              </button>
              {collapsed && <span className={styles.navTooltip}>Log Out</span>}
            </div>
          </div>
        </nav>
      </aside>

      <main style={{
        marginLeft: `${sidebarWidth + 32}px`,
        transition: 'margin-left 0.4s ease',
        padding: '32px',
        flex: 1,
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  );
}