import React, { useState, useEffect } from "react";
import { Users, FileText, FileCheck, Settings } from "lucide-react";
import { db } from "../database/db";
import StatCard from "../components/dashboard/StatCard";
import RecentLetters from "../components/dashboard/RecentLetters";
import RecentResidents from "../components/dashboard/RecentResidents";
import Card from "../components/ui/Card";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalLetters: 0,
    completedLetters: 0,
    letterTypes: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const residentsCount = await db.residents.count();
        const lettersCount = await db.letters.count();
        const completedCount = await db.letters
          .where("status")
          .equals("completed")
          .or("status")
          .equals("signed")
          .count();

        const letters = await db.letters.toArray();
        const uniqueTypes = new Set(letters.map((letter) => letter.letterType));

        setStats({
          totalResidents: residentsCount,
          totalLetters: lettersCount,
          completedLetters: completedCount,
          letterTypes: uniqueTypes.size,
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Warga"
          value={isLoading ? "..." : stats.totalResidents}
          icon={<Users size={24} />}
          color="teal"
        />

        <StatCard
          title="Total Surat"
          value={isLoading ? "..." : stats.totalLetters}
          icon={<FileText size={24} />}
          color="blue"
        />

        <StatCard
          title="Surat Selesai"
          value={isLoading ? "..." : stats.completedLetters}
          icon={<FileCheck size={24} />}
          color="amber"
        />

        <StatCard
          title="Jenis Surat"
          value={isLoading ? "..." : stats.letterTypes}
          icon={<Settings size={24} />}
          color="rose"
        />
      </div>
    </div>
  );
};

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  href,
}) => {
  const navigate = href;

  return (
    <a
      href={navigate}
      className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border border-gray-200 hover:bg-teal-50 hover:border-teal-200 transition-colors"
    >
      <div className="bg-teal-100 p-3 rounded-full mb-2">
        <span className="text-teal-700">{icon}</span>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </a>
  );
};

export default Dashboard;
