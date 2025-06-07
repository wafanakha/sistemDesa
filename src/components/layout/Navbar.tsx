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
