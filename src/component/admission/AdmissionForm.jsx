import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import API from "@/axios/axios.js";
import { toast } from 'react-toastify';

const AdmissionForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);

  const [formData, setFormData] = useState({
    patientId: '',
    roomId: '',
    bedId: '',
    reason: '',
    diagnosis: '',
    doctorId: '',
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token récupéré:', token ? 'OUI' : 'NON');
      
      // Charger les patients
      try {
        console.log('Appel API patients: /api/v1/patients');
        const patientsResponse = await API.get('/api/v1/patients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Réponse patients complète:', patientsResponse);
        console.log('Réponse patients data:', patientsResponse.data);
        
        let patientsData = [];
        if (Array.isArray(patientsResponse.data)) {
          patientsData = patientsResponse.data;
        } else if (patientsResponse.data.data && Array.isArray(patientsResponse.data.data)) {
          patientsData = patientsResponse.data.data;
        } else if (patientsResponse.data.docs && Array.isArray(patientsResponse.data.docs)) {
          patientsData = patientsResponse.data.docs;
        } else if (patientsResponse.data.patients && Array.isArray(patientsResponse.data.patients)) {
          patientsData = patientsResponse.data.patients;
        }
        
        console.log('Patients transformés:', patientsData);
        setPatients(patientsData);
      } catch (error) {
        console.error('Erreur chargement patients:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        toast.error('Erreur lors du chargement des patients');
        setPatients([]);
      }

      // Charger les docteurs
      try {
        console.log('Appel API docteurs: /api/v1/doctors/get');
        const doctorsResponse = await API.get('/api/v1/doctors/get', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Réponse docteurs complète:', doctorsResponse);
        console.log('Réponse docteurs data:', doctorsResponse.data);
        
        let doctorsData = [];
        if (Array.isArray(doctorsResponse.data)) {
          doctorsData = doctorsResponse.data;
        } else if (doctorsResponse.data.data && Array.isArray(doctorsResponse.data.data)) {
          doctorsData = doctorsResponse.data.data;
        } else if (doctorsResponse.data.docs && Array.isArray(doctorsResponse.data.docs)) {
          doctorsData = doctorsResponse.data.docs;
        } else if (doctorsResponse.data.doctors && Array.isArray(doctorsResponse.data.doctors)) {
          doctorsData = doctorsResponse.data.doctors;
        }
        
        console.log('Docteurs transformés:', doctorsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Erreur chargement docteurs:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        toast.error('Erreur lors du chargement des docteurs');
        setDoctors([]);
      }

      // Charger les chambres
      try {
        console.log('Appel API chambres: /api/rooms/simple');
        const roomsResponse = await API.get('/api/rooms/simple', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Réponse chambres complète:', roomsResponse);
        console.log('Réponse chambres data:', roomsResponse.data);
        
        let roomsData = [];
        if (Array.isArray(roomsResponse.data)) {
          roomsData = roomsResponse.data;
        } else if (roomsResponse.data.data && Array.isArray(roomsResponse.data.data)) {
          roomsData = roomsResponse.data.data;
        } else if (roomsResponse.data.docs && Array.isArray(roomsResponse.data.docs)) {
          roomsData = roomsResponse.data.docs;
        } else if (roomsResponse.data.rooms && Array.isArray(roomsResponse.data.rooms)) {
          roomsData = roomsResponse.data.rooms;
        }
        
        console.log('Chambres transformées:', roomsData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Erreur chargement chambres:', error);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        toast.error('Erreur lors du chargement des chambres');
        setRooms([]);
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const fetchAvailableBeds = async (roomId) => {
    try {
      // NETTOYER L'ID DE LA CHAMBRE - supprimer les caractères invalides
      const cleanRoomId = roomId.replace(/[^a-f0-9]/gi, '');
      
      console.log('ID original:', roomId);
      console.log('ID nettoyé:', cleanRoomId);
      
      if (cleanRoomId.length !== 24) {
        throw new Error('ID de chambre invalide');
      }

      const token = localStorage.getItem('token');
      const response = await API.get(`/api/rooms/${cleanRoomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let room = response.data;
      if (response.data.data) {
        room = response.data.data;
      } else if (response.data.room) {
        room = response.data.room;
      }
      
      const beds = room.beds?.filter(bed => bed.status === 'available') || [];
      setAvailableBeds(beds);
      
    } catch (error) {
      console.error('Erreur chargement lits:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      toast.error('Erreur lors du chargement des lits');
      setAvailableBeds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Soumission formulaire:', formData);
      
      await API.post('/api/v1/admissions', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Patient admis avec succès');
      onSuccess();
    } catch (error) {
      console.error('Erreur admission:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'admission');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'roomId' && value) {
      fetchAvailableBeds(value);
    } else if (name === 'roomId' && !value) {
      setAvailableBeds([]);
      setFormData(prev => ({ ...prev, bedId: '' }));
    }
  };

  // Vérifier que patients est bien un tableau avant d'utiliser map
  const patientsArray = Array.isArray(patients) ? patients : [];
  const doctorsArray = Array.isArray(doctors) ? doctors : [];
  const roomsArray = Array.isArray(rooms) ? rooms : [];

  console.log('Render - Patients:', patientsArray.length);
  console.log('Render - Doctors:', doctorsArray.length);
  console.log('Render - Rooms:', roomsArray.length);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Nouvelle Admission</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient *
            </label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Sélectionner un patient</option>
              {patientsArray.map((patient) => (
                <option key={patient._id} value={patient._id}>
                   {patient.fullName} - {patient.phone}
                  {patient.email && ` - ${patient.email}`}
                </option>
              ))}
            </select>
            {patientsArray.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Aucun patient disponible</p>
            )}
          </div>

          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chambre *
            </label>
            <select
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Sélectionner une chambre</option>
              {roomsArray.map((room) => (
                <option key={room._id} value={room._id}>
                  Chambre {room.number} - {room.type} ({room.status})
                </option>
              ))}
            </select>
            {roomsArray.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Aucune chambre disponible</p>
            )}
          </div>

          {/* Bed Selection */}
          {formData.roomId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lit *
              </label>
              <select
                name="bedId"
                value={formData.bedId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sélectionner un lit</option>
                {availableBeds.map((bed) => (
                  <option key={bed._id} value={bed._id}>
                    Lit {bed.number}
                  </option>
                ))}
              </select>
              {availableBeds.length === 0 && formData.roomId && (
                <p className="text-sm text-red-600 mt-2">Aucun lit disponible dans cette chambre</p>
              )}
            </div>
          )}

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin *
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Sélectionner un médecin</option>
              {doctorsArray.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                  {doctor.specialty && ` - ${doctor.specialty}`}
                </option>
              ))}
            </select>
            {doctorsArray.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Aucun médecin disponible</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison de l'admission *
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ex: Fracture, Infection, etc."
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnostic
            </label>
            <input
              type="text"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ex: Fracture du radius distal"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Notes supplémentaires..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.bedId}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Admission...' : 'Admettre le patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionForm;