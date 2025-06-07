import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  submenu?: {
    title: string;
    path: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: <Home size={20} />,
  },
  {
    title: "Data Warga",
    path: "/residents",
    icon: <Users size={20} />,
    submenu: [
      {
        title: "Daftar Warga",
        path: "/residents",
      },
      {
        title: "Tambah Warga",
        path: "/residents/add",
      },
      {
        title: "Field Kustom",
        path: "/residents/custom-fields",
      },
    ],
  },
  {
    title: "Monografi",
    path: "/",
    icon: <FileText size={20} />,
    submenu: [
      {
        title: "Agama",
        path: "/monografi/agama",
      },
      {
        title: "Jenis Kelamin",
        path: "/monografi/gender",
      },
      {
        title: "Golongan Darah",
        path: "/monografi/goldarah",
      },
      {
        title: "Kepala Keluarga",
        path: "/monografi/kk",
      },
      {
        title: "Pekerjaan",
        path: "/monografi/pekerjaan",
      },
      {
        title: "Pendidikan",
        path: "/monografi/pendidikan",
      },
      {
        title: "Status Pernikahan",
        path: "/monografi/perkawinan",
      },
      {
        title: "Umur",
        path: "/monografi/umur",
      },
    ],
  },
  {
    title: "Surat",
    path: "/letters",
    icon: <FileText size={20} />,
    submenu: [
      {
        title: "Daftar Surat",
        path: "/letters",
      },
      {
        title: "Buat Surat",
        path: "/letters/create",
      },
      {
        title: "Template Surat",
        path: "/letters/templates",
      },
    ],
  },
  {
    title: "Pengaturan",
    path: "/settings",
    icon: <Settings size={20} />,
  },
  {
    title: "Bantuan",
    path: "/help",
    icon: <HelpCircle size={20} />,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isOpen, onToggle }) => {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  const toggleSubmenu = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const sidebarClasses = `bg-white h-full shadow-lg z-30 transition-all duration-300 ease-in-out ${
    isMobile
      ? isOpen
        ? "fixed inset-y-0 left-0 w-64"
        : "fixed inset-y-0 -left-64 w-64"
      : "sticky top-0 w-64"
  }`;

  const MenuItem = ({ item }: { item: MenuItem }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.title];

    return (
      <div>
        {hasSubmenu ? (
          <div className="mb-1">
            <button
              className="flex items-center justify-between w-full px-4 py-2 text-left text-gray-700 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors"
              onClick={() => toggleSubmenu(item.title)}
            >
              <div className="flex items-center">
                <span className="mr-3 text-gray-500">{item.icon}</span>
                <span>{item.title}</span>
              </div>
              <span>
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </span>
            </button>

            {isExpanded && (
              <div className="pl-10 mt-1 space-y-1 text-sm">
                {item.submenu!.map((subitem) => (
                  <NavLink
                    key={subitem.path}
                    to={subitem.path}
                    className={({ isActive }) =>
                      `block px-4 py-2 rounded-md ${
                        isActive
                          ? "bg-teal-50 text-teal-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                    onClick={isMobile ? onToggle : undefined}
                  >
                    {subitem.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 mb-1 rounded-md ${
                isActive
                  ? "bg-teal-700 text-white font-medium"
                  : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
              }`
            }
            onClick={isMobile ? onToggle : undefined}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`mr-3 ${
                    isActive ? "text-white" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </>
            )}
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={onToggle}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-xl font-bold text-teal-700">Datuk Pengging</h1>
          {isMobile && (
            <button onClick={onToggle} className="p-1">
              <X size={24} className="text-gray-500" />
            </button>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </nav>
      </aside>

      {isMobile && (
        <button
          className={`fixed bottom-4 right-4 bg-teal-700 text-white p-3 rounded-full shadow-lg z-40 transition-opacity duration-300 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
          onClick={onToggle}
        >
          <Menu size={24} />
        </button>
      )}
    </>
  );
};

export default Sidebar;
