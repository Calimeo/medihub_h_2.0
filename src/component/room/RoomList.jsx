import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import API from "@/axios/axios.js";

const RoomList = ({ onSelectRoom, refresh }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRooms();
  }, [refresh]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Essayez d'abord l'endpoint principal
      const response = await API.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Vérifiez la structure de la réponse
      console.log('Réponse API:', response.data);
      
      // Gestion de différentes structures de réponse
      if (response.data.data) {
        // Structure avec pagination: { success: true, data: { docs: [...] } }
        setRooms(response.data.data.docs || response.data.data || []);
      } else if (response.data.docs) {
        // Structure paginate directe: { docs: [...] }
        setRooms(response.data.docs);
      } else if (Array.isArray(response.data)) {
        // Tableau direct
        setRooms(response.data);
      } else {
        // Structure avec data array: { success: true, data: [...] }
        setRooms(response.data.data || []);
      }
      
    } catch (error) {
      console.error('Erreur API:', error);
      
      // Fallback: essayez l'endpoint simple
      try {
        const token = localStorage.getItem('token');
        const simpleResponse = await API.get('/api/rooms/simple', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Réponse simple API:', simpleResponse.data);
        
        if (Array.isArray(simpleResponse.data)) {
          setRooms(simpleResponse.data);
        } else if (simpleResponse.data.data) {
          setRooms(simpleResponse.data.data);
        } else {
          setRooms(simpleResponse.data.docs || []);
        }
        
      } catch (fallbackError) {
        console.error('Erreur fallback API:', fallbackError);
        toast.error('Erreur lors du chargement des chambres');
        setRooms([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Chambre supprimée avec succès');
      fetchRooms();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || room.type === filterType;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-purple-100 text-purple-800';
      case 'icu': return 'bg-red-100 text-red-800';
      case 'emergency': return 'bg-orange-100 text-orange-800';
      case 'maternity': return 'bg-pink-100 text-pink-800';
      case 'pediatric': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les types</option>
            <option value="standard">Standard</option>
            <option value="private">Privée</option>
            <option value="icu">USI</option>
            <option value="emergency">Urgence</option>
            <option value="maternity">Maternité</option>
            <option value="pediatric">Pédiatrie</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="full">Pleine</option>
            <option value="maintenance">Maintenance</option>
            <option value="closed">Fermée</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredRooms.length} chambre(s) trouvée(s)
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="p-6">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              {rooms.length === 0 ? 'Aucune chambre' : 'Aucune chambre correspondante'}
            </h3>
            <p className="text-gray-500 mt-2">
              {rooms.length === 0 
                ? 'Commencez par créer votre première chambre.' 
                : 'Aucune chambre ne correspond à vos critères de recherche.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <div key={room._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Chambre {room.number}</h3>
                    {room.name && (
                      <p className="text-gray-600">{room.name}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(room.type)}`}>
                      {room.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacité:</span>
                    <span className="font-medium">{room.capacity} lits</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lits occupés:</span>
                    <span className="font-medium">
                      {room.beds?.filter(bed => bed.status === 'occupied').length || 0}
                    </span>
                  </div>
                  {room.floor && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Étage:</span>
                      <span className="font-medium">{room.floor}</span>
                    </div>
                  )}
                  {room.wing && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Aile:</span>
                      <span className="font-medium">{room.wing}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => onSelectRoom(room)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Voir les lits
                  </button>
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Supprimer"
                  >
                    <TrashIcon className="w-4 h-4" />
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

export default RoomList;