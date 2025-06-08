import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Automatically close sidebar on mobile, open on desktop
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />

        <main className="ml-64 w-full p-4">
          <Navbar onToggleSidebar={toggleSidebar} isMobile={isMobile} />

          <div className="flex-1 p-6">
            <Outlet />
          </div>

          <footer className="bg-white border-t px-6 py-4">
            <p className="text-sm text-center text-gray-600">
              &copy; {new Date().getFullYear()} Sistem Administrasi Desa - Versi
              0.1.0
            </p>
          </footer>
        </main>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Layout;