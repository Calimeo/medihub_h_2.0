import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API from "@/axios/axios.js";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Catégories prédéfinies pour les services
  const categories = [
    "consultation",
      "urgence",
      "chirurgie",
      "traitement",
      "radiologie",
      "laboratoire",
      "pharmacie",
      "hospitalisation",
      "autre"
  ];

  // États pour la création/édition de service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    requirements: '',
    notes: '',
    availability: 'available'
  });

  // États pour l'ajout de médecin
  const [doctorForm, setDoctorForm] = useState({
    serviceId: '',
    doctorId: ''
  });

  // Configuration Axios pour inclure le token d'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchServices();
    fetchDoctors();
    fetchStats();
  }, []);

  // Récupérer tous les services de l'hôpital connecté
  const fetchServices = async () => {
    try {
      setLoading(true);
      // Récupérer l'ID de l'hôpital connecté (supposant qu'il est stocké dans le localStorage)
      const hospitalId = localStorage.getItem('hospitalId') || JSON.parse(localStorage.getItem('user'))._id;
      
      // Utiliser l'endpoint qui récupère les services par hôpital
      const response = await API.get(`/api/services/hospital/${hospitalId}`);
      setServices(response.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des services');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les médecins de l'hôpital connecté
  const fetchDoctors = async () => {
    try {
      // Récupérer l'ID de l'hôpital connecté
      const hospitalId = localStorage.getItem('hospitalId') || JSON.parse(localStorage.getItem('user'))._id;
      
      const response = await API.get(`/api/doctors/hospital/${hospitalId}`);
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins', error);
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await API.get('/api/services/stats/analytics');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques', error);
    }
  };

  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchesCategory = filterCategory ? service.category === filterCategory : true;
    const matchesSearch = searchTerm 
      ? service.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      || service.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });

  // Créer un service
  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/api/services', serviceForm);
      setServices([...services, response.data.data]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Service créé avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du service');
    }
  };

  // Mettre à jour un service
  const handleUpdateService = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/api/services/${selectedService._id}`, serviceForm);
      setServices(services.map(s => s._id === selectedService._id ? response.data.data : s));
      setShowEditModal(false);
      resetForm();
      toast.success('Service mis à jour avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du service');
    }
  };

  // Supprimer un service
  const handleDeleteService = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service?')) return;
    
    try {
      await API.delete(`/api/services/${id}`);
      setServices(services.filter(s => s._id !== id));
      toast.success('Service supprimé avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du service');
    }
  };

  // Ajouter un médecin à un service
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/api/services/doctors/add', doctorForm);
      setServices(services.map(s => s._id === doctorForm.serviceId ? response.data.data : s));
      setShowDoctorModal(false);
      setDoctorForm({ serviceId: '', doctorId: '' });
      toast.success('Médecin ajouté au service avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du médecin');
    }
  };

  // Retirer un médecin d'un service
  const handleRemoveDoctor = async (serviceId, doctorId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce médecin du service?')) return;
    
    try {
      const response = await API.post('/api/services/doctors/remove', {
        serviceId,
        doctorId
      });
      setServices(services.map(s => s._id === serviceId ? response.data.data : s));
      toast.success('Médecin retiré du service avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait du médecin');
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setServiceForm({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      requirements: '',
      notes: '',
      availability: 'available'
    });
  };

  // Ouvrir le modal d'édition
  const openEditModal = (service) => {
    setSelectedService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      requirements: service.requirements,
      notes: service.notes,
      availability: service.availability
    });
    setShowEditModal(true);
  };

  // Ouvrir le modal d'ajout de médecin
  const openDoctorModal = (serviceId) => {
    setDoctorForm({ serviceId, doctorId: '' });
    setShowDoctorModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Services</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Créer un Service
        </button>
      </div>

      {/* Filtres et recherche - Version compacte */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par catégorie</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="Nom ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistiques compactes */}
      {stats && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Statistiques des Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h3 className="text-md font-medium text-blue-800">Total</h3>
              <p className="text-xl font-bold">{stats.totalServices}</p>
            </div>
            {stats.byCategory.slice(0, 3).map(cat => (
              <div key={cat._id} className="bg-gray-50 p-3 rounded-lg">
                <h3 className="text-md font-medium text-gray-800 truncate">{cat._id || 'Sans catégorie'}</h3>
                <p className="text-xl font-bold">{cat.count}</p>
                <p className="text-xs text-gray-600">
                  D: {cat.available} | L: {cat.limited} | I: {cat.unavailable}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des services */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Chargement des services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Aucun service trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredServices.map(service => (
              <div key={service._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        service.availability === 'available' 
                          ? 'bg-green-100 text-green-800'
                          : service.availability === 'limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.availability === 'available' 
                          ? 'Disponible' 
                          : service.availability === 'limited'
                          ? 'Limité'
                          : 'Indisponible'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Prix:</span>
                        <p className="font-medium">{service.price} Gdes</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Durée:</span>
                        <p className="font-medium">{service.duration} min</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Catégorie:</span>
                        <p className="font-medium">{service.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Médecins:</span>
                        <p className="font-medium">{service.doctors?.length || 0}</p>
                      </div>
                    </div>
                    
                    {service.requirements && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Prérequis: </span>
                        <span className="text-xs">{service.requirements}</span>
                      </div>
                    )}
                    
                    {/* Liste des médecins assignés */}
                    {service.doctors && service.doctors.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Médecins:</h4>
                        <div className="flex flex-wrap gap-1">
                          {service.doctors.map(doctor => (
                            <div key={doctor._id} className="flex items-center bg-gray-100 rounded-full px-2 py-0.5">
                              <span className="text-xs">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </span>
                              <button
                                onClick={() => handleRemoveDoctor(service._id, doctor._id)}
                                className="ml-1 text-red-500 hover:text-red-700 text-xs"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2 flex flex-col space-y-1">
                    <button
                      onClick={() => openEditModal(service)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => openDoctorModal(service._id)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                    >
                      + Médecin
                    </button>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création de service - Version compacte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Nouveau service</h2>
              <form onSubmit={handleCreateService}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (Gdes) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                    <select
                      required
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
                      <input
                        type="text"
                        value={serviceForm.requirements}
                        onChange={(e) => setServiceForm({...serviceForm, requirements: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                      <select
                        value={serviceForm.availability}
                        onChange={(e) => setServiceForm({...serviceForm, availability: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="available">Disponible</option>
                        <option value="limited">Limité</option>
                        <option value="unavailable">Indisponible</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={serviceForm.notes}
                      onChange={(e) => setServiceForm({...serviceForm, notes: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="2"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de service - Version compacte */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Modifier le service</h2>
              <form onSubmit={handleUpdateService}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (Gdes) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={serviceForm.price}
                        onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                    <select
                      required
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prérequis</label>
                      <input
                        type="text"
                        value={serviceForm.requirements}
                        onChange={(e) => setServiceForm({...serviceForm, requirements: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilité</label>
                      <select
                        value={serviceForm.availability}
                        onChange={(e) => setServiceForm({...serviceForm, availability: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="available">Disponible</option>
                        <option value="limited">Limité</option>
                        <option value="unavailable">Indisponible</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={serviceForm.notes}
                      onChange={(e) => setServiceForm({...serviceForm, notes: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="2"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de médecin - Version compacte */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3">Ajouter un médecin</h2>
              <form onSubmit={handleAddDoctor}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Médecin *</label>
                    <select
                      required
                      value={doctorForm.doctorId}
                      onChange={(e) => setDoctorForm({...doctorForm, doctorId: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Sélectionner...</option>
                      {doctors.map(doctor => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialty})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowDoctorModal(false)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;