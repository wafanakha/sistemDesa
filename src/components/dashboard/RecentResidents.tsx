import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Eye } from 'lucide-react';
import { residentService } from '../../database/residentService';
import { Resident } from '../../types';
import Card from '../ui/Card';

const RecentResidents: React.FC = () => {
  const [recentResidents, setRecentResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecentResidents = async () => {
      try {
        const residents = await residentService.getAllResidents();
        
        // Sort by created date (newest first) and take the 5 most recent
        const sortedResidents = residents
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);
        
        setRecentResidents(sortedResidents);
      } catch (error) {
        console.error('Error fetching recent residents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentResidents();
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <Card title="Warga Terbaru">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center py-3 border-b last:border-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card title="Warga Terbaru">
      {recentResidents.length > 0 ? (
        <div className="divide-y">
          {recentResidents.map((resident) => (
            <div key={resident.id} className="py-3 flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <User size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{resident.name}</h4>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                  <span>NIK: {resident.nik}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(resident.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/residents/view/${resident.id}`)}
                className="text-gray-500 hover:text-blue-600 p-1"
                title="Lihat Detail"
              >
                <Eye size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">Belum ada warga yang ditambahkan</p>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/residents')}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Lihat Semua Warga
        </button>
      </div>
    </Card>
  );
};

export default RecentResidents;