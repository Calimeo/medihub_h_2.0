// frontend/src/pages/LaboratoryManagement.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '@/axios/axios.js';

const LaboratoryManagement = () => {
  const [laboratories, setLaboratories] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);
  
  const [newLab, setNewLab] = useState({
    name: '',
    department: ''
  });

  const [patientForm, setPatientForm] = useState({
    labId: '',
    patientId: ''
  });

  const [testForm, setTestForm] = useState({
    labId: '',
    patientId: '',
    testName: '',
    result: ''
  });

  // Hook pour debugger la structure de l'API
  const useApiDebug = (endpoint) => {
    useEffect(() => {
      const debugApi = async () => {
        try {
          const response = await API.get(endpoint);
          console.log(`📊 ${endpoint} response:`, response);
          console.log(`📊 ${endpoint} data:`, response.data);
          console.log(`📊 ${endpoint} data type:`, typeof response.data);
          
          if (response.data && typeof response.data === 'object') {
            console.log(`📊 ${endpoint} data keys:`, Object.keys(response.data));
          }
        } catch (error) {
          console.error(`❌ ${endpoint} error:`, error);
        }
      };
      
      debugApi();
    }, [endpoint]);
  };

  // Débogage des endpoints
  useApiDebug('/api/v1/patients');
  useApiDebug('/api/v1/laboratoire');

  useEffect(() => {
    fetchLaboratories();
    fetchPatients();
  }, []);

  const fetchLaboratories = async () => {
    try {
      const response = await API.get('/api/v1/laboratoire');
      
      // Extraction robuste des données
      const extractData = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.laboratories && Array.isArray(data.laboratories)) return data.laboratories;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.items && Array.isArray(data.items)) return data.items;
        if (data?.results && Array.isArray(data.results)) return data.results;
        return [];
      };
      
      const labsData = extractData(response.data);
      console.log('Laboratoires extraits:', labsData);
      
      setLaboratories(labsData);
    } catch (error) {
      console.error('Erreur fetchLaboratories:', error);
      console.error('Détails erreur:', error.response?.data);
      toast.error('Erreur lors du chargement des laboratoires');
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await API.get('/api/v1/patients');
      
      console.log('🩺 Réponse patients complète:', response);
      
      // Extraction robuste des données patients
      const extractPatientsData = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.patients && Array.isArray(data.patients)) return data.patients;
        if (data?.data && Array.isArray(data.data)) return data.data;
        if (data?.items && Array.isArray(data.items)) return data.items;
        if (data?.results && Array.isArray(data.results)) return data.results;
        if (data?.success && Array.isArray(data.data)) return data.data;
        return [];
      };
      
      const patientsData = extractPatientsData(response.data);
      console.log('📋 Patients extraits:', patientsData);
      
      setPatients(patientsData);
      
    } catch (error) {
      console.error('❌ Erreur fetchPatients:', error);
      console.error('📊 Réponse erreur:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des patients');
      setPatients([]);
    }
  };

  const handleCreateLab = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await API.post('/api/v1/laboratoire', newLab);
      toast.success('Laboratoire créé avec succès');
      setShowCreateModal(false);
      setNewLab({ name: '', department: '' });
      fetchLaboratories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du laboratoire');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await API.post('/api/v1/laboratoire/patients', patientForm);
      toast.success('Patient ajouté au laboratoire');
      setShowAddPatientModal(false);
      setPatientForm({ labId: '', patientId: '' });
      fetchLaboratories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du patient');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await API.post('/api/v1/laboratoire/tests', testForm);
      toast.success('Test ajouté avec succès');
      setShowAddTestModal(false);
      setTestForm({ labId: '', patientId: '', testName: '', result: '' });
      fetchLaboratories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du test');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLab = async (labId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce laboratoire ?')) {
      return;
    }

    try {
      await API.delete(`/api/v1/laboratoire/${labId}`);
      toast.success('Laboratoire supprimé avec succès');
      fetchLaboratories();
      if (selectedLab && selectedLab._id === labId) {
        setSelectedLab(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // S'assurer que filteredPatients est toujours un tableau
  const filteredPatients = Array.isArray(patients) 
    ? patients.filter(patient => 
        selectedLab ? patient.hospital === selectedLab.hospital?._id : true
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Gestion des Laboratoires</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nouveau Laboratoire
        </button>
      </div>

      {/* Debug info (à retirer en production) */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          <strong>Debug:</strong> {patients.length} patients chargés, {laboratories.length} laboratoires
        </p>
      </div>

      {/* Liste des laboratoires */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.isArray(laboratories) && laboratories.map((lab) => (
          <div key={lab._id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold text-blue-800">{lab.name}</h3>
            <p className="text-gray-600">{lab.department}</p>
            <p className="text-sm text-gray-500">
              Hôpital: {lab.hospital?.name || 'Votre hôpital'}
            </p>
            
            <div className="mt-4">
              <p className="font-medium">Patients: {Array.isArray(lab.patients) ? lab.patients.length : 0}</p>
              <p className="font-medium">Tests: {Array.isArray(lab.tests) ? lab.tests.length : 0}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedLab(lab);
                  setShowAddPatientModal(true);
                  setPatientForm(prev => ({ ...prev, labId: lab._id }));
                }}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Ajouter Patient
              </button>
              <button
                onClick={() => {
                  setSelectedLab(lab);
                  setShowAddTestModal(true);
                  setTestForm(prev => ({ ...prev, labId: lab._id }));
                }}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
              >
                Ajouter Test
              </button>
              <button
                onClick={() => setSelectedLab(lab)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Détails
              </button>
              <button
                onClick={() => handleDeleteLab(lab._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucun laboratoire */}
      {Array.isArray(laboratories) && laboratories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun laboratoire créé pour le moment</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Créer votre premier laboratoire
          </button>
        </div>
      )}

      {/* Détails du laboratoire sélectionné */}
      {selectedLab && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Détails: {selectedLab.name}</h2>
            <button
              onClick={() => setSelectedLab(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Fermer
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liste des patients */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Patients ({Array.isArray(selectedLab.patients) ? selectedLab.patients.length : 0})
              </h3>
              {Array.isArray(selectedLab.patients) && selectedLab.patients.length > 0 ? (
                <div className="space-y-2">
                  {selectedLab.patients.map((patient) => (
                    <div key={patient._id} className="border rounded p-3">
                      <p className="font-medium">{patient.fullName}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                      <p className="text-xs text-gray-500">{patient.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun patient dans ce laboratoire</p>
              )}
            </div>

            {/* Liste des tests */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Tests ({Array.isArray(selectedLab.tests) ? selectedLab.tests.length : 0})
              </h3>
              {Array.isArray(selectedLab.tests) && selectedLab.tests.length > 0 ? (
                <div className="space-y-2">
                  {selectedLab.tests.map((test, index) => (
                    <div key={index} className="border rounded p-3">
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm">Résultat: {test.result}</p>
                      <p className="text-xs text-gray-500">
                        Patient: {test.patient?.fullName || 'Inconnu'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Date: {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun test effectué</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de laboratoire */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Nouveau Laboratoire</h2>
            <form onSubmit={handleCreateLab}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input
                  type="text"
                  value={newLab.name}
                  onChange={(e) => setNewLab({ ...newLab, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Département *</label>
                <input
                  type="text"
                  value={newLab.department}
                  onChange={(e) => setNewLab({ ...newLab, department: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Le laboratoire sera automatiquement associé à votre hôpital
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de patient */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Ajouter un Patient</h2>
            <form onSubmit={handleAddPatient}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Laboratoire *</label>
                <select
                  value={patientForm.labId}
                  onChange={(e) => setPatientForm({ ...patientForm, labId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un laboratoire</option>
                  {Array.isArray(laboratories) && laboratories.map((lab) => (
                    <option key={lab._id} value={lab._id}>
                      {lab.name} - {lab.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select
                  value={patientForm.patientId}
                  onChange={(e) => setPatientForm({ ...patientForm, patientId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {filteredPatients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de test */}
      {showAddTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Ajouter un Test</h2>
            <form onSubmit={handleAddTest}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Laboratoire *</label>
                <select
                  value={testForm.labId}
                  onChange={(e) => setTestForm({ ...testForm, labId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un laboratoire</option>
                  {Array.isArray(laboratories) && laboratories.map((lab) => (
                    <option key={lab._id} value={lab._id}>
                      {lab.name} - {lab.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Patient *</label>
                <select
                  value={testForm.patientId}
                  onChange={(e) => setTestForm({ ...testForm, patientId: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Sélectionner un patient</option>
                  {filteredPatients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullName} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Nom du test *</label>
                <input
                  type="text"
                  value={testForm.testName}
                  onChange={(e) => setTestForm({ ...testForm, testName: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Résultat *</label>
                <textarea
                  value={testForm.result}
                  onChange={(e) => setTestForm({ ...testForm, result: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTestModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryManagement;