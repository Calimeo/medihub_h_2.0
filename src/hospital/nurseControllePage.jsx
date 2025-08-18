import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '@/axios/axios';
import NurseForm from '@/component/nurse/NurseForm.jsx';
import NurseShiftModal from '@/component/nurse/NurseShiftModal.jsx';
import WorkHoursReport from '@/component/nurse/WorkHoursReport.jsx';

const NurseManagementPage = () => {
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [onDutyNurses, setOnDutyNurses] = useState([]);
  const navigate = useNavigate();

  // Fetch all nurses
  const fetchNurses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await API.get('/api/nurses', {
        params: { search: searchTerm },
        headers: { Authorization: `Bearer ${token}` }
      });
      setNurses(data.nurses);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des infirmières');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nurses on duty today
  const fetchOnDutyNurses = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await API.get('/api/nurses/on-duty', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOnDutyNurses(data.nurses);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des gardes');
    }
  };

  useEffect(() => {
    fetchNurses();
    fetchOnDutyNurses();
  }, [searchTerm]);

  // Add new nurse
  const handleAddNurse = async (nurseData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await API.post('/api/nurses', nurseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      setShowForm(false);
      fetchNurses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  // Delete nurse
  const handleDeleteNurse = async (nurseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette infirmière ?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await API.delete(`/api/nurses/${nurseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      fetchNurses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Schedule shift
  const handleScheduleShift = async (shiftData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await API.post('/api/nurses/shifts', shiftData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      setShowShiftModal(false);
      fetchNurses();
      fetchOnDutyNurses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la planification');
    } finally {
      setLoading(false);
    }
  };

  // Complete shift
  const handleCompleteShift = async (nurseId, shiftId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { data } = await API.put('/api/nurses/shifts/complete', {
        nurseId,
        shiftId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(data.message);
      fetchNurses();
      fetchOnDutyNurses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Infirmières</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter une infirmière
          </button>
          
          <button
            onClick={() => navigate('/nurses/shifts')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Planifier une garde
          </button>
        </div>
      </div>

      {/* On Duty Nurses Card */}
      {onDutyNurses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">Infirmières de garde aujourd'hui</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onDutyNurses.map(nurse => (
              <div key={nurse.id} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-lg text-gray-800">{nurse.name}</h3>
                <p className="text-gray-600">{nurse.phone}</p>
                <div className="mt-2">
                  {nurse.shifts.map((shift, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        shift.shiftType === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                        shift.shiftType === 'afternoon' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {shift.shiftType === 'morning' ? 'Matin' : 
                         shift.shiftType === 'afternoon' ? 'Après-midi' : 'Nuit'}
                      </span>
                      {!shift.completed && (
                        <button
                          onClick={() => handleCompleteShift(nurse.id, shift._id)}
                          className="text-xs text-green-600 hover:text-green-800"
                        >
                          Marquer comme terminé
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              id="search"
              placeholder="Nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Nurses List */}
      {loading && nurses.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : nurses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Aucune infirmière trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
            <div className="col-span-4 md:col-span-3">Infirmière</div>
            <div className="col-span-3 md:col-span-2">Contact</div>
            <div className="col-span-3 md:col-span-2">Heures travaillées</div>
            <div className="col-span-2 md:col-span-3">Dernière garde</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          
          {nurses.map(nurse => (
            <div key={nurse._id} className="grid grid-cols-12 p-4 border-b items-center hover:bg-gray-50">
              <div className="col-span-4 md:col-span-3">
                <p className="font-medium">{nurse.name}</p>
                <p className="text-sm text-gray-500">{nurse.email}</p>
              </div>
              <div className="col-span-3 md:col-span-2">
                {nurse.phone || <span className="text-gray-400">Non renseigné</span>}
              </div>
              <div className="col-span-3 md:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{nurse.totalHours || 0}h</span>
                  <button 
                    onClick={() => {
                      setSelectedNurse(nurse);
                      setShowHoursModal(true);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    (Détails)
                  </button>
                </div>
              </div>
              <div className="col-span-2 md:col-span-3">
                {nurse.shifts?.length > 0 ? (
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      nurse.shifts[0].completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {new Date(nurse.shifts[0].date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">Aucune garde</span>
                )}
              </div>
              <div className="col-span-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    setSelectedNurse(nurse);
                    setShowShiftModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Planifier une garde"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteNurse(nurse._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <NurseForm 
          onClose={() => setShowForm(false)}
          onSubmit={handleAddNurse}
          loading={loading}
        />
      )}

      {showShiftModal && selectedNurse && (
        <NurseShiftModal
          nurse={selectedNurse}
          onClose={() => setShowShiftModal(false)}
          onSubmit={handleScheduleShift}
          loading={loading}
        />
      )}

      {showHoursModal && selectedNurse && (
        <WorkHoursReport
          nurse={selectedNurse}
          onClose={() => setShowHoursModal(false)}
        />
      )}
    </div>
  );
};

export default NurseManagementPage;