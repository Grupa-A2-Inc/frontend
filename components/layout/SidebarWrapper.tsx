"use client";

import { useState, useEffect } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, loadUserFromStorage, User } from "@/store/slices/authSlice";
import { useTheme } from "@/components/ThemeProvider";

// ---------- Types ----------

type NavRole = "admin" | "teacher" | "student";

interface NavItemConfig {
  icon: string;
  label: string;
  href: string;
}

interface NavItemProps {
  item: NavItemConfig;
  collapsed: boolean;
  pathname: string;
}

interface SidebarWrapperProps {
  children: React.ReactNode;
}

// ---------- Nav config ----------

const navConfig: Record<NavRole, NavItemConfig[]> = {
  admin: [
    { icon: "dashboard", label: "Dashboard", href: "/dashboard/admin" },
    { icon: "group",     label: "Users",     href: "/dashboard/admin/users" },
    { icon: "school",    label: "Classes",   href: "/dashboard/admin/classes" },
    { icon: "settings",  label: "Settings",  href: "/dashboard/admin/settings" },
  ],
  teacher: [
    { icon: "book",       label: "My Courses", href: "/dashboard/teacher" },
    { icon: "assignment", label: "Tests",      href: "/dashboard/teacher/tests" },
    { icon: "bar_chart",  label: "Students",   href: "/dashboard/teacher/students" },
  ],
  student: [
    { icon: "book",        label: "Courses",     href: "/dashboard/student" },
    { icon: "trending_up", label: "My Progress", href: "/dashboard/student/progress" },
    { icon: "assignment",  label: "My Tests",    href: "/dashboard/student/tests" },
  ],
};

// ---------- Helpers ----------

function getDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim() || "User";
}

function getNavRole(user: User): NavRole {
  if (user.role === "ORGANIZATION_ADMIN") return "admin";
  return user.role.toLowerCase() as NavRole;
}

function getProfileHref(user: User): string {
  const role = getNavRole(user);
  if (role === "admin") return "/dashboard/admin/profile";
  if (role === "teacher") return "/dashboard/teacher";
  return "/dashboard/student";
}

// ---------- NavItem ----------

function NavItem({ item, collapsed, pathname }: NavItemProps) {
  const isActive = pathname === item.href;
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={item.href} className="w-full block">
        <div
          className={`
            flex items-center w-full rounded-xl transition-all duration-200
            ${collapsed ? "justify-center py-2.5 px-2" : "gap-3 px-4 py-2.5"}

            ${
              isActive
                ? "text-brand-text bg-brand-primary/15"
                : "text-brand-text/70 hover:text-brand-text hover:bg-brand-primary/10"
            }
          `}
        >
  
          <div
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-200
              ${
                isActive
                  ? "h-6 w-[3px] bg-brand-primary"
                  : hovered
                  ? "h-5 w-[2px] bg-brand-primary/60"
                  : "h-4 w-[2px] bg-transparent"
              }
            `}
          />

          {/* ICON */}
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <span className="material-symbols-rounded text-brand-primary text-xl leading-none">
              {item.icon}
            </span>
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap text-sm font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Link>

      <AnimatePresence>
        {collapsed && hovered && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] px-3 py-1.5 rounded-lg bg-brand-card text-xs text-brand-text shadow-xl whitespace-nowrap border border-brand-primary/30 pointer-events-none"
            style={{
              top: "var(--tooltip-top)",
              left: "var(--tooltip-left)",
            }}
            ref={(el) => {
              if (el) {
                const li = el.closest("li");
                if (li) {
                  const rect = li.getBoundingClientRect();
                  el.style.setProperty(
                    "--tooltip-top",
                    `${rect.top + rect.height / 2 - 12}px`
                  );
                  el.style.setProperty(
                    "--tooltip-left",
                    `${rect.right + 12}px`
                  );
                }
              }
            }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </li>
  );
}

// ---------- SidebarWrapper ----------

export default function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [collapsed, setCollapsed]         = useState(true);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const router    = useRouter();
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();
  const authUser  = useAppSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(JSON.parse(saved));
    dispatch(loadUserFromStorage());
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const sidebarWidth   = collapsed ? 72 : 250;
  const navItems: NavItemConfig[] = authUser
    ? (navConfig[getNavRole(authUser)] ?? [])
    : [];

  const displayName  = authUser ? getDisplayName(authUser) : "User";
  const displayEmail = authUser?.email ?? "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-brand-bg transition-colors duration-300">
      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-screen bg-brand-card border-r border-brand-primary/10 flex flex-col transition-colors duration-300"
      >
        {/* HEADER */}
        <div
          className={`flex items-center border-b border-brand-primary/15 flex-shrink-0 ${
            collapsed
              ? "flex-col gap-3 p-3 justify-center"
              : "justify-between px-4 py-4"
          }`}
          style={{ minHeight: "72px", transition: "all 0.3s ease" }}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Image
              src="/my_logo.png"
              alt="logo"
              width={38}
              height={38}
              className="flex-shrink-0"
            />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-brand-text font-semibold text-lg whitespace-nowrap"
                >
                  Testify<span className="text-brand-primary">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary hover:bg-brand-primary/30 transition-colors"
            style={{ border: "none", cursor: "pointer" }}
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="material-symbols-rounded"
              style={{ fontSize: "1.3rem" }}
            >
              chevron_left
            </motion.span>
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col flex-1 justify-between py-3 min-h-0 overflow-visible">
          <div
            className="flex-1 min-h-0 overflow-y-auto overflow-x-visible"
            style={{ scrollbarWidth: "none" }}
          >
            <ul
              className="flex flex-col gap-1 overflow-visible"
              style={{ padding: collapsed ? "0 6px" : "0 10px" }}
            >
              {navItems.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              ))}
            </ul>
          </div>

          {/* FOOTER */}
          <div
            className="flex flex-col gap-2 flex-shrink-0 border-t border-brand-primary/15"
            style={{ padding: collapsed ? "8px 8px" : "10px 12px" }}
          >
            {/* User profile */}
            <AnimatePresence mode="wait">
              {!collapsed ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={authUser ? getProfileHref(authUser) : "/"}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-brand-primary/15 transition-colors no-underline bg-brand-primary/8"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {avatarLetter}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-brand-text text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {displayName}
                      </span>
                      <span className="text-brand-muted text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {displayEmail}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-center"
                >
                  <Link href={authUser ? getProfileHref(authUser) : "/"}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer">
                      {avatarLetter}
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Theme toggle */}
            <div className="relative"
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={toggleTheme}
                className={`flex items-center w-full rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-primary/10 transition-colors text-sm font-medium ${
                  collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"
                }`}
                style={{ border: "none", cursor: "pointer", background: "transparent" }}
              >
                <span className="material-symbols-rounded flex-shrink-0" style={{ fontSize: "1.2rem" }}>
                  {theme === "dark" ? "light_mode" : "dark_mode"}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Logout */}
            <div
              className="relative"
              onMouseEnter={() => setLogoutHovered(true)}
              onMouseLeave={() => setLogoutHovered(false)}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                onClick={handleLogout}
                className={`flex items-center w-full rounded-xl text-brand-muted hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium ${
                  collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"
                }`}
                style={{ border: "none", cursor: "pointer", background: "transparent" }}
              >
                <span className="material-symbols-rounded flex-shrink-0" style={{ fontSize: "1.2rem" }}>
                  logout
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      Log Out
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Logout tooltip */}
              <AnimatePresence>
                {collapsed && logoutHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-[9999] px-3 py-1.5 rounded-lg bg-brand-card text-xs text-brand-text shadow-xl whitespace-nowrap border border-brand-primary/30 pointer-events-none"
                    ref={(el) => {
                      if (el) {
                        const parent = el.closest(".relative");
                        if (parent) {
                          const rect = parent.getBoundingClientRect();
                          el.style.top  = `${rect.top + rect.height / 2 - 12}px`;
                          el.style.left = `${rect.right + 12}px`;
                        }
                      }
                    }}
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </motion.aside>

      {/* CONTENT */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="flex-1 p-8 min-h-screen"
      >
        {children}
      </motion.main>
    </div>
  );
}
