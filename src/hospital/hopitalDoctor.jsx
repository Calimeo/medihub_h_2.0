import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { 
  FaUserMd, 
  FaPhone, 
  FaEnvelope, 
  FaCalendarAlt,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaUserClock
} from "react-icons/fa";
import { MdWork, MdLocationOn } from "react-icons/md";
import API from "@/axios/axios.js";

const HospitalDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      const { data } = await API.get(
        "/api/v1/doctors/get",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setDoctors(data.doctors || []);
      
      // Initialiser les statuts
      const initialStatus = {};
      data.doctors.forEach(doc => {
        initialStatus[doc._id] = doc.status || 'present'; // 'present', 'absent', 'on_break'
      });
      setStatusUpdates(initialStatus);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorStatus = async (doctorId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/api/v1/doctors/status/${doctorId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      setStatusUpdates(prev => ({
        ...prev,
        [doctorId]: newStatus
      }));
      
      toast.success("Statut mis à jour avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour.");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'on_break': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <FaCheckCircle className="mr-1" />;
      case 'absent': return <FaTimesCircle className="mr-1" />;
      case 'on_break': return <FaUserClock className="mr-1" />;
      default: return <FaUserMd className="mr-1" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700 flex items-center">
              <FaUserMd className="mr-3" />
              Médecins de l'hôpital
            </h1>
            <p className="text-gray-600 mt-2">
              Gestion des médecins et de leur disponibilité
            </p>
          </div>
          
          <button
            onClick={() => navigate("/hospital/doctors")}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all mt-4 md:mt-0"
          >
            <FaPlus />
            Ajouter un médecin
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <FaUserMd className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun médecin trouvé</h3>
            <p className="text-gray-500 mt-1">Commencez par ajouter des médecins à votre établissement</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <img
                    src={doc.docAvatar?.url || "/doctor-avatar.jpg"}
                    alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(statusUpdates[doc._id])}`}>
                      {getStatusIcon(statusUpdates[doc._id])}
                      {statusUpdates[doc._id] === 'present' && 'Présent'}
                      {statusUpdates[doc._id] === 'absent' && 'Absent'}
                      {statusUpdates[doc._id] === 'on_break' && 'En pause'}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>
                      <p className="text-sm text-emerald-600 font-medium">
                        {doc.specialization || 'Spécialité non spécifiée'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MdWork className="flex-shrink-0 mr-2 text-gray-500" />
                      <span>{doc.doctorDepartment || 'Département non spécifié'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaPhone className="flex-shrink-0 mr-2 text-gray-500" />
                      <span>{doc.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaEnvelope className="flex-shrink-0 mr-2 text-gray-500" />
                      <span>{doc.email}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      Statut de disponibilité
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateDoctorStatus(doc._id, 'present')}
                        className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${statusUpdates[doc._id] === 'present' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                      >
                        Présent
                      </button>
                      <button
                        onClick={() => updateDoctorStatus(doc._id, 'on_break')}
                        className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${statusUpdates[doc._id] === 'on_break' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                      >
                        En pause
                      </button>
                      <button
                        onClick={() => updateDoctorStatus(doc._id, 'absent')}
                        className={`py-2 px-2 text-xs font-medium rounded-md transition-colors ${statusUpdates[doc._id] === 'absent' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDoctors;