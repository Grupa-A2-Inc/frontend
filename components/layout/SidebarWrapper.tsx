"use client";
import { useState, useEffect } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navConfig = {
  admin: [
    { icon: "dashboard", label: "Dashboard", href: "/dashboard/admin" },
    { icon: "group", label: "Users", href: "/dashboard/admin/users" },
    { icon: "school", label: "Classes", href: "/dashboard/admin/classes" },
    { icon: "settings", label: "Settings", href: "/dashboard/admin/settings" },
  ],
  teacher: [
    { icon: "book", label: "My Courses", href: "/dashboard/teacher" },
    { icon: "assignment", label: "Tests", href: "/dashboard/teacher/tests" },
    {
      icon: "bar_chart",
      label: "Students",
      href: "/dashboard/teacher/students",
    },
  ],
  student: [
    { icon: "book", label: "Courses", href: "/dashboard/student" },
    {
      icon: "trending_up",
      label: "My Progress",
      href: "/dashboard/student/progress",
    },
    { icon: "assignment", label: "My Tests", href: "/dashboard/student/tests" },
  ],
};

function NavItem({ item, collapsed, pathname }: any) {
  const isActive = pathname === item.href;
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={item.href} className="w-full block">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={`
            flex items-center w-full rounded-xl
            ${collapsed ? "justify-center py-2.5 px-2" : "gap-3 px-4 py-2.5"}
            ${
              isActive
                ? "bg-[#7c6fcd]/25 text-white"
                : "text-white/70 hover:text-white hover:bg-[#7c6fcd]/15"
            }
          `}
        >
          <div className="relative flex items-center justify-center w-6 h-6 flex-shrink-0">
            <span className="material-symbols-rounded text-[#7c6fcd] text-xl leading-none">
              {item.icon}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeDot"
                className="absolute -left-2.5 w-1.5 h-1.5 rounded-full bg-[#7c6fcd]"
              />
            )}
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
        </motion.div>
      </Link>

      <AnimatePresence>
        {collapsed && hovered && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] px-3 py-1.5 rounded-lg bg-[#1a2540] text-xs text-white shadow-xl whitespace-nowrap border border-[#7c6fcd]/30 pointer-events-none"
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
                    `${rect.top + rect.height / 2 - 12}px`,
                  );
                  el.style.setProperty(
                    "--tooltip-left",
                    `${rect.right + 12}px`,
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

export default function SidebarWrapper({ children }: any) {
  const [collapsed, setCollapsed] = useState(true);
  const [logoutHovered, setLogoutHovered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
  });

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser({
        name: parsed.name || `${parsed.adminFirstName} ${parsed.adminLastName}`,
        email: parsed.email || parsed.adminEmail,
        role: parsed.role || "admin",
      });
    }
  }, []);

  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const sidebarWidth = collapsed ? 72 : 250;
  const navItems = navConfig[user.role as keyof typeof navConfig] || [];

  return (
    <div className="flex min-h-screen bg-[#0a0f1f]">
      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-screen bg-[#0d1528] flex flex-col"
      >
        {/* HEADER */}
        <div
          className={`flex items-center border-b border-[#7c6fcd]/15 flex-shrink-0 ${
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
                  className="text-white font-semibold text-lg whitespace-nowrap"
                >
                  Testify<span className="text-[#7c6fcd]">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-[#7c6fcd]/15 text-[#7c6fcd] hover:bg-[#7c6fcd]/30 transition-colors"
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
          {/* Nav items */}
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
            className="flex flex-col gap-2 flex-shrink-0"
            style={{
              padding: collapsed ? "8px 8px" : "10px 12px",
              borderTop: "1px solid rgba(124, 111, 205, 0.15)",
            }}
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
                    href="/dashboard/admin/profile"
                    className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#7c6fcd]/15 transition-colors no-underline"
                    style={{ background: "rgba(124, 111, 205, 0.08)" }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-white text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                        {user.name}
                      </span>
                      <span className="text-white/40 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                        {user.email}
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
                  <Link href="/dashboard/admin/profile">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center text-white text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

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
                className={`flex items-center w-full rounded-xl text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium ${
                  collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2.5"
                }`}
                style={{
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                <span
                  className="material-symbols-rounded flex-shrink-0"
                  style={{ fontSize: "1.2rem" }}
                >
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
                    className="fixed z-[9999] px-3 py-1.5 rounded-lg bg-[#1a2540] text-xs text-white shadow-xl whitespace-nowrap border border-[#7c6fcd]/30 pointer-events-none"
                    ref={(el) => {
                      if (el) {
                        const parent = el.closest(".relative");
                        if (parent) {
                          const rect = parent.getBoundingClientRect();
                          el.style.top = `${rect.top + rect.height / 2 - 12}px`;
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
