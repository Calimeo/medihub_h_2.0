import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UserIcon,
  HomeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import API from "@/axios/axios.js";
import { toast } from 'react-toastify';

const AdmissionStats = () => {
  const [stats, setStats] = useState({
    totalAdmissions: 0,
    activeAdmissions: 0,
    dischargedToday: 0,
    averageStay: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Simuler des statistiques (à adapter avec votre API)
      const response = await API.get('/api/v1/admissions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const admissions = response.data.data || response.data;
      
      setStats({
        totalAdmissions: admissions.length,
        activeAdmissions: admissions.length,
        dischargedToday: Math.floor(Math.random() * 5),
        averageStay: 3.5
      });
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admissions Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAdmissions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients Actifs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeAdmissions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Déchargés Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats.dischargedToday}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Séjour Moyen (jours)</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageStay}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <HomeIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Statistiques des Admissions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Répartition par Service</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Médecine Générale</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chirurgie</span>
                <span className="font-medium">25%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pédiatrie</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Urgence</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Autres</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Taux d'Occupation</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taux global</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              
              <div className="flex justify-between text-sm mt-4">
                <span className="text-gray-600">Chambres occupées</span>
                <span className="font-medium">24/30</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionStats;