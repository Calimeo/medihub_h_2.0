import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import API from "@/axios/axios.js";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AddPatientForm({ onSuccess }) {
  const { isAuthenticated, user } = useContext(Context);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    contact: { phone: "", email: "", address: "" },
    medicalHistory: { allergies: "", chronicDiseases: "", medications: "", surgeries: "" },
    responsable: { name: "", relation: "", phone: "" },
  });

  const handleChange = (e, group = null, subField = null) => {
    const { name, value } = e.target;
    if (group && subField) {
      setFormData(prev => ({
        ...prev,
        [group]: {
          ...prev[group],
          [subField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation des champs requis
    if (formData.fullName.trim() === "") {
      toast.error("Nom complet requis");
      setLoading(false);
      return;
    }
    if (!formData.bloodGroup) {
      toast.error("Choisissez un groupe sanguin");
      setLoading(false);
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error("Date de naissance requise");
      setLoading(false);
      return;
    }

    try {
      // Utilisation du token d'authentification du contexte
      const token = localStorage.getItem("token") || user?.token;
      
      if (!token) {
        toast.error("Veuillez vous connecter pour ajouter un patient");
        setLoading(false);
        return;
      }

      // Appel à l'API
      const response = await API.post(
        "/api/v1/patients",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Afficher l'accusé de réception
        setCreatedPatient(response.data.patient || {
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          contact: formData.contact
        });
        setShowSuccess(true);
        
        toast.success("Patient enregistré avec succès");
        if (onSuccess) onSuccess();
        
        // Réinitialisation du formulaire après un délai
        setTimeout(() => {
          setFormData({
            fullName: "",
            dateOfBirth: "",
            gender: "",
            bloodGroup: "",
            contact: { phone: "", email: "", address: "" },
            medicalHistory: { allergies: "", chronicDiseases: "", medications: "", surgeries: "" },
            responsable: { name: "", relation: "", phone: "" },
          });
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur API:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expirée. Veuillez vous reconnecter");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erreur lors de l'enregistrement du patient");
      }
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccess(false);
    setCreatedPatient(null);
  };

  // Formatage de la date de naissance
  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Modal de succès */}
      {showSuccess && createdPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={closeSuccessModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Patient créé avec succès !
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-left">
                <h4 className="font-semibold text-green-800 mb-2">Détails du patient :</h4>
                <p className="text-sm text-green-700">
                  <strong>Nom :</strong> {createdPatient.fullName}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Date de naissance :</strong> {formatDate(createdPatient.dateOfBirth)}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Téléphone :</strong> {createdPatient.contact?.phone || "Non spécifié"}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Email :</strong> {createdPatient.contact?.email || "Non spécifié"}
                </p>
              </div>
              
              <button
                onClick={closeSuccessModal}
                className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-8 md:p-10 shadow-2xl rounded-3xl space-y-6 relative"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Ajouter un patient</h2>

        {/* Section des informations personnelles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Informations personnelles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Nom complet *"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="date"
              name="dateOfBirth"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <select
              name="gender"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={formData.gender}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Sexe *</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
              <option value="Autre">Autre</option>
            </select>
            <select
              name="bloodGroup"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Groupe sanguin *</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Coordonnées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Téléphone"
              value={formData.contact.phone}
              onChange={(e) => handleChange(e, "contact", "phone")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.contact.email}
              onChange={(e) => handleChange(e, "contact", "email")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Adresse"
              value={formData.contact.address}
              onChange={(e) => handleChange(e, "contact", "address")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors col-span-full"
              disabled={loading}
            />
          </div>
        </div>

        {/* Section Antécédents médicaux */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Antécédents médicaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Allergies"
              value={formData.medicalHistory.allergies}
              onChange={(e) => handleChange(e, "medicalHistory", "allergies")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Maladies chroniques"
              value={formData.medicalHistory.chronicDiseases}
              onChange={(e) => handleChange(e, "medicalHistory", "chronicDiseases")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Médicaments"
              value={formData.medicalHistory.medications}
              onChange={(e) => handleChange(e, "medicalHistory", "medications")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Chirurgies"
              value={formData.medicalHistory.surgeries}
              onChange={(e) => handleChange(e, "medicalHistory", "surgeries")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
        </div>

        {/* Section Responsable */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Personne responsable</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nom du responsable"
              value={formData.responsable.name}
              onChange={(e) => handleChange(e, "responsable", "name")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Lien du responsable"
              value={formData.responsable.relation}
              onChange={(e) => handleChange(e, "responsable", "relation")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
            <input
              type="tel"
              placeholder="Téléphone du responsable"
              value={formData.responsable.phone}
              onChange={(e) => handleChange(e, "responsable", "phone")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Enregistrement..." : "Enregistrer le patient"}
        </button>
      </form>
    </>
  );
}