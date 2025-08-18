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
  FaUserClock,
  FaCamera,
  FaIdCard,
  FaVenusMars,
  FaLock
} from "react-icons/fa";
import { MdWork } from "react-icons/md";
import API from "@/axios/axios.js";

const HospitalDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
    doctorDepartment: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      
      const initialStatus = {};
      data.doctors.forEach(doc => {
        initialStatus[doc._id] = doc.status || 'present';
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

  const handleInputChange = (e) => {
    setNewDoctor({
      ...newDoctor,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Vérification du format
      const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedFormats.includes(file.type)) {
        toast.error("Format d'image non supporté (PNG, JPEG ou WEBP uniquement)");
        return;
      }

      setAvatarFile(file);
      
      // Création de la preview
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewDoctor = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      // Validation des champs
      if (!avatarFile) {
        toast.error("L'avatar du médecin est requis");
        return;
      }

      if (newDoctor.password !== newDoctor.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas");
        return;
      }

      const formData = new FormData();
      formData.append("firstName", newDoctor.firstName);
      formData.append("lastName", newDoctor.lastName);
      formData.append("email", newDoctor.email);
      formData.append("phone", newDoctor.phone);
      formData.append("nic", newDoctor.nic);
      formData.append("dob", newDoctor.dob);
      formData.append("gender", newDoctor.gender);
      formData.append("password", newDoctor.password);
      formData.append("confirmPassword", newDoctor.confirmPassword);
      formData.append("doctorDepartment", newDoctor.doctorDepartment);
      formData.append("docAvatar", avatarFile);

      const { data } = await API.post("/api/v1/doctors/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });

      toast.success(data.message);
      setShowAddModal(false);
      fetchDoctors();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewDoctor({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nic: "",
      dob: "",
      gender: "",
      password: "",
      confirmPassword: "",
      doctorDepartment: ""
    });
    setAvatarFile(null);
    setAvatarPreview("");
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
            onClick={() => setShowAddModal(true)}
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

      {/* Modal d'ajout de médecin */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Ajouter un nouveau médecin
                </h2>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={addNewDoctor}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colonne gauche */}
                  <div className="space-y-4">
                    {/* Avatar */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Photo du médecin (requis)
                      </label>
                      <div className="flex items-center">
                        <label className="cursor-pointer">
                          <div className="w-32 h-32 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center p-4">
                                <FaCamera className="mx-auto text-gray-400 text-2xl mb-2" />
                                <span className="text-xs text-gray-500">PNG, JPEG, WEBP</span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                            required
                          />
                        </label>
                      </div>
                    </div>

                    {/* Informations personnelles */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaUserMd className="mr-2 text-emerald-600" />
                        Informations personnelles
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                          <input
                            type="text"
                            name="firstName"
                            value={newDoctor.firstName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                          <input
                            type="text"
                            name="lastName"
                            value={newDoctor.lastName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                          <div className="relative">
                            <input
                              type="date"
                              name="dob"
                              value={newDoctor.dob}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              required
                            />
                            <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Genre *</label>
                          <select
                            name="gender"
                            value={newDoctor.gender}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          >
                            <option value="">Sélectionner</option>
                            <option value="Male">Masculin</option>
                            <option value="Female">Féminin</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Colonne droite */}
                  <div className="space-y-4">
                    {/* Coordonnées */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaEnvelope className="mr-2 text-emerald-600" />
                        Coordonnées
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={newDoctor.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                          <div className="relative">
                            <input
                              type="tel"
                              name="phone"
                              value={newDoctor.phone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              required
                            />
                            <FaPhone className="absolute right-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">NIC/CNI *</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="nic"
                              value={newDoctor.nic}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              required
                            />
                            <FaIdCard className="absolute right-3 top-3 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Département *</label>
                          <input
                            type="text"
                            name="doctorDepartment"
                            value={newDoctor.doctorDepartment}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <FaLock className="mr-2 text-emerald-600" />
                        Authentification
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                          <input
                            type="password"
                            name="password"
                            value={newDoctor.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={newDoctor.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </span>
                    ) : 'Enregistrer le médecin'}
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

export default HospitalDoctorsPage;