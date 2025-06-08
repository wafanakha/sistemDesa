import React, { useState, useEffect } from "react";
import { Users, History, MapPin, ChevronRight, FileText } from "lucide-react";
import { db } from "../database/db";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { VillageInfo } from "../types";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    recentHistory: [] as Array<{ name: string; type: string; date: string }>,
  });
  const [village, setVillage] = useState<VillageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const residentsCount = await db.residents.count();
        const history = await db.letterHistory
          .orderBy("date")
          .reverse()
          .limit(5)
          .toArray();

        const villageInfo = await db.villageInfo.toCollection().first();

        setStats({
          totalResidents: residentsCount,
          recentHistory: history.map((item) => ({
            name: item.name,
            type: item.letter,
            date: item.date,
          })),
        });

        if (villageInfo) setVillage(villageInfo);
      } catch (error) {
        console.error("Error loading stats or village info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const typeLabel = (type: string) => {
    const map: Record<string, { label: string; color: string }> = {
      usaha: { label: "Usaha", color: "bg-blue-100 text-blue-800" },
      domisili: { label: "Domisili", color: "bg-green-100 text-green-800" },
      kematian: { label: "Kematian", color: "bg-gray-100 text-gray-800" },
      lahir: { label: "Kelahiran", color: "bg-pink-100 text-pink-800" },
      miskin: { label: "Miskin", color: "bg-amber-100 text-amber-800" },
      pengantar: { label: "Pengantar", color: "bg-purple-100 text-purple-800" },
    };
    const info = map[type] || {
      label: type,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`${info.color} text-base font-semibold px-3 py-1 rounded-full`}
      >
        {info.label}
      </span>
    );
  };

  const historyColumns = [
    {
      header: "Nama",
      accessor: (item: any) => (
        <span className="font-semibold text-lg">{item.name}</span>
      ),
      className: "min-w-[200px]",
    },
    {
      header: "Jenis Surat",
      accessor: (item: any) => typeLabel(item.type),
      className: "min-w-[150px]",
    },
    {
      header: "Tanggal",
      accessor: (item: any) => (
        <span className="text-gray-700 text-base">{formatDate(item.date)}</span>
      ),
      className: "min-w-[120px]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Ringkasan aktivitas dan statistik
          </p>
        </div>
      </div>

      {/* Village Info Card */}
      {village && (
        <Card className="bg-gradient-to-br from-white to-teal-50 border border-teal-100 shadow-sm p-6">
          <div className="flex items-center mb-5">
            <div className="bg-teal-100 p-3 rounded-lg mr-4">
              <MapPin className="text-teal-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Profil Desa</h3>
              <p className="text-lg text-gray-600">Informasi lengkap desa</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-lg">
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Nama Desa</p>
              <p className="text-gray-900">{village.name}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Kode Desa</p>
              <p className="text-gray-900">{village.VillageCode}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Kecamatan</p>
              <p className="text-gray-900">{village.districtName}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Kabupaten</p>
              <p className="text-gray-900">{village.regencyName}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Kepala Desa</p>
              <p className="text-gray-900">{village.leaderName}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Kasi Pemerintah</p>
              <p className="text-gray-900">{village.kasipemerintah}</p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-gray-700">Total Warga</p>
              <p className="text-gray-900">
                {isLoading
                  ? "..."
                  : stats.totalResidents.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Letters Section */}
      <Card className="border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <History className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Riwayat Surat Terbaru
              </h3>
              <p className="text-lg text-gray-500">
                5 surat terakhir yang dibuat
              </p>
            </div>
          </div>
          <a
            href="/letters/history"
            className="flex items-center text-base font-medium text-teal-600 hover:text-teal-800 transition-colors"
          >
            Lihat Semua <ChevronRight className="ml-1" size={20} />
          </a>
        </div>
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-pulse text-gray-400 text-lg">
                Memuat data...
              </div>
            </div>
          ) : stats.recentHistory.length > 0 ? (
            <Table
              columns={historyColumns}
              data={stats.recentHistory}
              keyField="date"
              compact
              hover
              className="[&_th]:bg-gray-50 [&_th]:text-gray-600 [&_th]:text-base [&_th]:font-semibold"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="text-gray-300 mb-2" size={32} />
              <p className="text-gray-500 text-lg">Belum ada riwayat surat</p>
              <p className="text-base text-gray-400 mt-1">
                Surat yang dibuat akan muncul di sini
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
