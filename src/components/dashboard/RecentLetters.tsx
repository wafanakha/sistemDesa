import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';
import { letterService } from '../../database/letterService';
import { residentService } from '../../database/residentService';
import { Letter, Resident } from '../../types';
import Card from '../ui/Card';

const RecentLetters: React.FC = () => {
  const [recentLetters, setRecentLetters] = useState<(Letter & { residentName: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRecentLetters = async () => {
      try {
        const letters = await letterService.getAllLetters();
        
        // Sort by created date (newest first) and take the 5 most recent
        const sortedLetters = letters
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5);
        
        // Get resident names for each letter
        const lettersWithNames = await Promise.all(
          sortedLetters.map(async (letter) => {
            const resident = await residentService.getResidentById(letter.residentId);
            return {
              ...letter,
              residentName: resident ? resident.name : 'Unknown'
            };
          })
        );
        
        setRecentLetters(lettersWithNames);
      } catch (error) {
        console.error('Error fetching recent letters:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentLetters();
  }, []);
  
  const getLetterTypeLabel = (type: string) => {
    switch (type) {
      case 'domicile': return 'Keterangan Domisili';
      case 'poverty': return 'Keterangan Tidak Mampu';
      case 'introduction': return 'Pengantar';
      case 'business': return 'Keterangan Usaha';
      case 'birth': return 'Keterangan Kelahiran';
      case 'custom': return 'Kustom';
      default: return type;
    }
  };
  
  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'draft':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'signed':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    const statusLabels: Record<string, string> = {
      draft: 'Draft',
      completed: 'Selesai',
      signed: 'Ditandatangani'
    };
    
    return (
      <span className={`${bgColor} ${textColor} text-xs px-2 py-1 rounded-full`}>
        {statusLabels[status] || status}
      </span>
    );
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <Card title="Surat Terbaru">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center py-3 border-b last:border-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  return (
    <Card title="Surat Terbaru">
      {recentLetters.length > 0 ? (
        <div className="divide-y">
          {recentLetters.map((letter) => (
            <div key={letter.id} className="py-3 flex items-center">
              <div className="bg-teal-100 p-2 rounded-full mr-3">
                <FileText size={20} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{letter.title}</h4>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                  <span>{letter.residentName}</span>
                  <span className="mx-2">•</span>
                  <span>{getLetterTypeLabel(letter.letterType)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(letter.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(letter.status)}
                <button
                  onClick={() => navigate(`/letters/view/${letter.id}`)}
                  className="text-gray-500 hover:text-teal-600 p-1"
                  title="Lihat Detail"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">Belum ada surat yang dibuat</p>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/letters')}
          className="text-teal-600 hover:text-teal-800 text-sm font-medium"
        >
          Lihat Semua Surat
        </button>
      </div>
    </Card>
  );
};

export default RecentLetters;