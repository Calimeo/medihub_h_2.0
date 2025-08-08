import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

const AddDoctorPage = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
    password: "",
    doctorDepartment: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return toast.error("Vous devez être connecté.");

    try {
      const { data } = await API.post(
        "/api/v1/doctors/add",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Médecin ajouté avec succès !");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        nic: "",
        dob: "",
        gender: "",
        password: "",
        doctorDepartment: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'ajout du médecin"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-start">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-emerald-700 mb-6 text-center">
          Ajouter un Médecin
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="Prénom"
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Nom"
            required
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Téléphone (11 chiffres)"
            required
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="nic"
            value={form.nic}
            onChange={handleChange}
            placeholder="CIN"
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            placeholder="Date de naissance"
            className="border p-2 rounded"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          >
            <option value="">-- Sexe --</option>
            <option value="Male">Homme</option>
            <option value="Female">Femme</option>
          </select>
          <input
            type="text"
            name="doctorDepartment"
            value={form.doctorDepartment}
            onChange={handleChange}
            placeholder="Département"
            required
            className="border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            required
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="col-span-full bg-emerald-600 text-white py-3 rounded hover:bg-emerald-700 transition"
          >
            Ajouter le médecin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorPage;
