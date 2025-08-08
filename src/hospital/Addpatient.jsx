import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import API from "@/axios/axios.js";

export default function AddPatientForm({ onSuccess }) {
  const { user, token } = useContext(Context);

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
    if (formData.fullName.trim() === "") return toast.error("Nom complet requis");
    if (!formData.bloodGroup) return toast.error("Choisissez un groupe sanguin");

    try {
      const localToken = localStorage.getItem("token");

await API.post(
  "/api/v1/patients",
  formData,
  {
    headers: {
      Authorization: `Bearer ${localToken}`,
    },
  }
);

      toast.success("Patient enregistré avec succès");
      if (onSuccess) onSuccess();
      setFormData({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        contact: { phone: "", email: "", address: "" },
        medicalHistory: { allergies: "", chronicDiseases: "", medications: "", surgeries: "" },
        responsable: { name: "", relation: "", phone: "" },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l’enregistrement");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <h2 className="text-2xl font-semibold col-span-full mb-2 text-center">Ajouter un patient</h2>

      <input
        type="text"
        name="fullName"
        placeholder="Nom complet"
        className="input-style"
        value={formData.fullName}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="dateOfBirth"
        className="input-style"
        value={formData.dateOfBirth}
        onChange={handleChange}
        required
      />
      <select
        name="gender"
        className="input-style"
        value={formData.gender}
        onChange={handleChange}
        required
      >
        <option value="">Sexe</option>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Autre">Autre</option>
      </select>
      <select
        name="bloodGroup"
        className="input-style"
        value={formData.bloodGroup}
        onChange={handleChange}
        required
      >
        <option value="">Groupe sanguin</option>
        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>

      {/* Contact */}
      <input
        type="tel"
        placeholder="Téléphone"
        value={formData.contact.phone}
        onChange={(e) => handleChange(e, "contact", "phone")}
        className="input-style"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.contact.email}
        onChange={(e) => handleChange(e, "contact", "email")}
        className="input-style"
      />
      <input
        type="text"
        placeholder="Adresse"
        value={formData.contact.address}
        onChange={(e) => handleChange(e, "contact", "address")}
        className="input-style col-span-full"
      />

      {/* Antécédents médicaux */}
      <input
        type="text"
        placeholder="Allergies"
        value={formData.medicalHistory.allergies}
        onChange={(e) => handleChange(e, "medicalHistory", "allergies")}
        className="input-style"
      />
      <input
        type="text"
        placeholder="Maladies chroniques"
        value={formData.medicalHistory.chronicDiseases}
        onChange={(e) => handleChange(e, "medicalHistory", "chronicDiseases")}
        className="input-style"
      />
      <input
        type="text"
        placeholder="Médicaments"
        value={formData.medicalHistory.medications}
        onChange={(e) => handleChange(e, "medicalHistory", "medications")}
        className="input-style"
      />
      <input
        type="text"
        placeholder="Chirurgies"
        value={formData.medicalHistory.surgeries}
        onChange={(e) => handleChange(e, "medicalHistory", "surgeries")}
        className="input-style"
      />

      {/* Responsable */}
      <input
        type="text"
        placeholder="Nom du responsable"
        value={formData.responsable.name}
        onChange={(e) => handleChange(e, "responsable", "name")}
        className="input-style"
        required
      />
      <input
        type="text"
        placeholder="Lien du responsable"
        value={formData.responsable.relation}
        onChange={(e) => handleChange(e, "responsable", "relation")}
        className="input-style"
      />
      <input
        type="tel"
        placeholder="Téléphone du responsable"
        value={formData.responsable.phone}
        onChange={(e) => handleChange(e, "responsable", "phone")}
        className="input-style"
      />

      <button
        type="submit"
        className="bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 col-span-full"
      >
        Enregistrer
      </button>
    </form>
  );
}
