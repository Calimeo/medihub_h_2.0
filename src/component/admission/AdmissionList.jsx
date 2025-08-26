import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  HomeIcon,
  CalendarIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import API from "@/axios/axios.js";
import { toast } from 'react-toastify';

const AdmissionList = ({ refresh }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchAdmissions();
  }, [refresh]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await API.get('/api/v1/admissions/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const admissionsData = response.data.data || response.data;
      setAdmissions(admissionsData);
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des admissions');
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const dischargePatient = async (admissionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir décharger ce patient ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await API.put(`/api/v1/admissions/${admissionId}/discharge`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Patient déchargé avec succès');
      fetchAdmissions();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la décharge');
    }
  };

  const filteredAdmissions = admissions.filter(admission => {
    const matchesSearch = 
      admission.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.room?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admission.patient?.phone?.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || admission.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'admitted': return 'bg-green-100 text-green-800';
      case 'discharged': return 'bg-gray-100 text-gray-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher patient, chambre ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="admitted">Admis</option>
            <option value="discharged">Déchargé</option>
            <option value="transferred">Transféré</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredAdmissions.length} admission(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Admissions Grid */}
      <div className="p-6">
        {filteredAdmissions.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {admissions.length === 0 ? 'Aucune admission active' : 'Aucune admission correspondante'}
            </h3>
            <p className="text-gray-500 mt-2">
              {admissions.length === 0 
                ? 'Commencez par admettre votre premier patient.' 
                : 'Aucune admission ne correspond à vos critères de recherche.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredAdmissions.map((admission) => (
              <div key={admission._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {admission.patient?.firstName} {admission.patient?.lastName}
                    </h3>
                    <p className="text-gray-600">
                      {admission.patient?.phone}
                      {admission.patient?.email && ` • ${admission.patient.email}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                      {admission.status === 'admitted' && 'Admis'}
                      {admission.status === 'discharged' && 'Déchargé'}
                      {admission.status === 'transferred' && 'Transféré'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Chambre</p>
                      <p className="font-medium">{admission.room?.number || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Médecin</p>
                      <p className="font-medium">
                        {admission.doctor?.firstName} {admission.doctor?.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Admission</p>
                      <p className="font-medium">{formatDate(admission.admissionDate)}</p>
                    </div>
                  </div>

                  {admission.dischargeDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Décharge</p>
                        <p className="font-medium">{formatDate(admission.dischargeDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Raison</p>
                    <p className="text-gray-800">{admission.reason}</p>
                  </div>
                  
                  {admission.diagnosis && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Diagnostic</p>
                      <p className="text-gray-800">{admission.diagnosis}</p>
                    </div>
                  )}

                  {admission.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-gray-800">{admission.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  {admission.status === 'admitted' && (
                    <button
                      onClick={() => dischargePatient(admission._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                    >
                      Décharger le patient
                    </button>
                  )}
                  
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmissionList;