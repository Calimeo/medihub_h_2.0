import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  HomeIcon, 
  UserIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import API from "@/axios/axios.js";

const RoomStats = () => {
  const [stats, setStats] = useState({});
  const [typeStats, setTypeStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get('/api/rooms/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Vérification que les données existent
      setStats(response.data.stats || {});
      setTypeStats(response.data.typeStats || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des statistiques');
      // Initialiser avec des valeurs par défaut en cas d'erreur
      setStats({});
      setTypeStats([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      standard: 'Standard',
      private: 'Privée',
      icu: 'USI',
      emergency: 'Urgence',
      maternity: 'Maternité',
      pediatric: 'Pédiatrie'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Valeurs par défaut pour éviter les erreurs
  const totalRooms = stats?.totalRooms || 0;
  const totalBeds = stats?.totalBeds || 0;
  const availableBeds = stats?.availableBeds || 0;
  const occupiedBeds = stats?.occupiedBeds || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Chambres</p>
              <p className="text-3xl font-bold text-gray-900">{totalRooms}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Lits</p>
              <p className="text-3xl font-bold text-gray-900">{totalBeds}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lits Disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{availableBeds}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lits Occupés</p>
              <p className="text-3xl font-bold text-gray-900">{occupiedBeds}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics by Type */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques par type de chambre</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {typeStats.map((typeStat) => (
            <div key={typeStat._id} className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                {getTypeLabel(typeStat._id)}
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chambres:</span>
                  <span className="font-medium">{typeStat.count || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total lits:</span>
                  <span className="font-medium">{typeStat.totalBeds || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lits disponibles:</span>
                  <span className="font-medium">{typeStat.availableBeds || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taux d'occupation:</span>
                  <span className="font-medium">
                    {typeStat.totalBeds > 0 
                      ? Math.round(((typeStat.totalBeds - (typeStat.availableBeds || 0)) / typeStat.totalBeds) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {typeStats.length === 0 && (
          <div className="text-center py-8">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune statistique disponible</p>
          </div>
        )}
      </div>

      {/* Utilization Rate */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux d'occupation global</h3>
        
        {totalBeds > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">
                {Math.round(((totalBeds - availableBeds) / totalBeds) * 100)}% d'occupation
              </span>
              <span className="text-sm text-gray-600">
                {totalBeds - availableBeds} / {totalBeds} lits
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((totalBeds - availableBeds) / totalBeds) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
              <div>Disponible: {availableBeds}</div>
              <div>Occupé: {occupiedBeds}</div>
              <div>Total: {totalBeds}</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Aucun lit disponible pour le calcul</p>
        )}
      </div>
    </div>
  );
};

export default RoomStats;