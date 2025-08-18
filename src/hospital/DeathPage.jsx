import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import API from '@/axios/axios'; // Votre instance axios configurée

const DeathPage = () => {
  const [deaths, setDeaths] = useState([]);
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    causeOfDeath: '',
    dateOfDeath: '',
    responsiblePerson: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Charger les décès
  const fetchDeaths = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/v1/death/hospital');
      if (response.data.success) {
        setDeaths(response.data.data);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des décès:', error);
      toast.error(error.response?.data?.message || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeaths();
  }, []);

  // Gestion des changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur quand l'utilisateur corrige
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.patientName) newErrors.patientName = 'Requis';
    if (!formData.causeOfDeath) newErrors.causeOfDeath = 'Requis';
    if (!formData.dateOfDeath) newErrors.dateOfDeath = 'Requis';
    if (!formData.responsiblePerson) newErrors.responsiblePerson = 'Requis';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const response = await API.post('/api/v1/death', formData);
      
      if (response.data.success) {
        toast.success('Décès enregistré avec succès');
        setFormData({
          patientName: '',
          patientId: '',
          causeOfDeath: '',
          dateOfDeath: '',
          responsiblePerson: '',
          notes: ''
        });
        fetchDeaths();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      
      // Gestion des erreurs de validation du serveur
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un décès
  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce décès ?')) return;
    
    try {
      setLoading(true);
      const response = await API.delete(`/api/v1/death/${id}`);
      
      if (response.data.success) {
        toast.success('Décès supprimé avec succès');
        fetchDeaths();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Décès</h1>
      
      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Enregistrer un nouveau décès</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du patient *</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.patientName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.patientName && <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID patient</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cause du décès *</label>
            <input
              type="text"
              name="causeOfDeath"
              value={formData.causeOfDeath}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.causeOfDeath ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.causeOfDeath && <p className="text-red-500 text-xs mt-1">{errors.causeOfDeath}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date du décès *</label>
            <input
              type="date"
              name="dateOfDeath"
              value={formData.dateOfDeath}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.dateOfDeath ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.dateOfDeath && <p className="text-red-500 text-xs mt-1">{errors.dateOfDeath}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
            <input
              type="text"
              name="responsiblePerson"
              value={formData.responsiblePerson}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.responsiblePerson ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.responsiblePerson && <p className="text-red-500 text-xs mt-1">{errors.responsiblePerson}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Liste des décès */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Liste des décès enregistrés</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : deaths.length === 0 ? (
          <p className="text-gray-500">Aucun décès enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cause</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deaths.map(death => (
                  <tr key={death._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{death.patientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{death.causeOfDeath}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(death.dateOfDeath).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{death.responsiblePerson}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleDelete(death._id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={loading}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeathPage;