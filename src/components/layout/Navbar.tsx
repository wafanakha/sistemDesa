import React from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isMobile }) => {
  const location = useLocation();

  // Get the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";
    if (path.startsWith("/residents")) {
      if (path === "/residents") return "Daftar Warga";
      if (path === "/residents/add") return "Tambah Warga";
      if (path === "/residents/custom-fields") return "Field Kustom";
      if (path.includes("/edit")) return "Edit Warga";
      if (path.includes("/view")) return "Detail Warga";
      return "Data Warga";
    }
    if (path.startsWith("/letters")) {
      if (path === "/letters") return "Daftar Surat";
      if (path === "/letters/create") return "Buat Surat";
      if (path === "/letters/templates") return "Template Surat";
      if (path.includes("/edit")) return "Edit Surat";
      if (path.includes("/view")) return "Detail Surat";
      return "Manajemen Surat";
    }
    if (path === "/settings") return "Pengaturan";
    if (path === "/help") return "Bantuan";

    return "Sistem Data Untuk Penduduk Kedungwringin";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        {isMobile && (
          <button
            onClick={onToggleSidebar}
            className="p-1 mr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu size={24} />
          </button>
        )}

        <h1 className="text-xl font-semibold text-gray-800">
          {getPageTitle()}
        </h1>

        <div className="flex items-center space-x-3">
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
