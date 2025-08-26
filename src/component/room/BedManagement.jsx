import React, { useState } from 'react';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  UserIcon,
  WrenchIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';
import API from "@/axios/axios.js";

const BedManagement = ({ room, onBack, onUpdate }) => {
  const [showAddBed, setShowAddBed] = useState(false);
  const [newBedNumber, setNewBedNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const addBed = async () => {
    if (!newBedNumber.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await API.post(`/api/rooms/${room._id}/beds`, {
        number: newBedNumber.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lit ajouté avec succès');
      setNewBedNumber('');
      setShowAddBed(false);
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du lit');
    } finally {
      setLoading(false);
    }
  };

  const updateBedStatus = async (bedId, status, patientId = null) => {
    try {
      const token = localStorage.getItem('token');
      await API.put(`/api/rooms/${room._id}/beds/${bedId}`, {
        status,
        patientId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Statut du lit mis à jour');
      onUpdate();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chambre {room.number}
              </h2>
              {room.name && (
                <p className="text-gray-600">{room.name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {room.beds?.filter(bed => bed.status === 'occupied').length} / {room.capacity} lits occupés
            </div>
            <button
              onClick={() => setShowAddBed(true)}
              disabled={room.beds?.length >= room.capacity}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter un lit
            </button>
          </div>
        </div>
      </div>

      {/* Beds Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {room.beds?.map((bed) => (
            <div key={bed._id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Lit {bed.number}</h3>
                <div className={`${getStatusColor(bed.status)} px-2 py-1 rounded-full text-xs font-medium border`}>
                  {bed.status === 'available' && 'Disponible'}
                  {bed.status === 'occupied' && 'Occupé'}
                  {bed.status === 'maintenance' && 'Maintenance'}
                  {bed.status === 'cleaning' && 'Nettoyage'}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {bed.patient && (
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm font-medium text-blue-900">Patient:</p>
                    <p className="text-sm text-blue-700">
                      {bed.patient.firstName} {bed.patient.lastName}
                    </p>
                    {bed.patient.phone && (
                      <p className="text-xs text-blue-600">{bed.patient.phone}</p>
                    )}
                  </div>
                )}

                {bed.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-medium">Notes:</p>
                    <p>{bed.notes}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Créé le: {new Date(bed.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {bed.status !== 'occupied' && (
                  <button
                    onClick={() => {
                      const patientId = prompt('ID du patient:');
                      if (patientId) {
                        updateBedStatus(bed._id, 'occupied', patientId);
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
                  >
                    Occupé
                  </button>
                )}
                
                {bed.status !== 'available' && (
                  <button
                    onClick={() => updateBedStatus(bed._id, 'available')}
                    className="flex-1 bg-gray-600 text-white py-1 px-2 rounded text-xs hover:bg-gray-700"
                  >
                    Disponible
                  </button>
                )}

                {bed.status !== 'maintenance' && (
                  <button
                    onClick={() => updateBedStatus(bed._id, 'maintenance')}
                    className="flex-1 bg-yellow-600 text-white py-1 px-2 rounded text-xs hover:bg-yellow-700"
                  >
                    Maintenance
                  </button>
                )}

                {bed.status !== 'cleaning' && (
                  <button
                    onClick={() => updateBedStatus(bed._id, 'cleaning')}
                    className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
                  >
                    Nettoyage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {room.beds?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aucun lit</h3>
            <p className="text-gray-500 mt-2">Ajoutez des lits à cette chambre.</p>
          </div>
        )}
      </div>

      {/* Add Bed Modal */}
      {showAddBed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un lit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro du lit *
                </label>
                <input
                  type="text"
                  value={newBedNumber}
                  onChange={(e) => setNewBedNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ex: A1"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBed(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={addBed}
                  disabled={loading || !newBedNumber.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedManagement;