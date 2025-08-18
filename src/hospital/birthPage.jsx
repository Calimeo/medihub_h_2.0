// src/pages/BirthPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

export default function BirthPage() {
  const [births, setBirths] = useState([]);
  const [form, setForm] = useState({
    babyName: "",
    gender: "",
    birthDate: "",
    motherName: "",
    fatherName: "",
    weight: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  // Charger la liste des naissances
  const fetchBirths = async () => {
    try {
      const res = await API.get("/api/v1/birth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBirths(res.data.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des naissances");
    }
  };

  useEffect(() => {
    fetchBirths();
  }, []);

  // Gérer la saisie du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Enregistrer ou mettre à jour une naissance
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(
          `/api/v1/birth/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Naissance mise à jour avec succès");
      } else {
        await API.post("/api/v1/birth", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Naissance ajoutée avec succès");
      }
      setForm({
        babyName: "",
        gender: "",
        birthDate: "",
        motherName: "",
        fatherName: "",
        weight: "",
        notes: "",
      });
      setEditingId(null);
      fetchBirths();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  // Modifier une naissance
  const handleEdit = (birth) => {
    setForm(birth);
    setEditingId(birth._id);
  };

  // Supprimer une naissance
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette naissance ?")) return;
    try {
      await API.delete(`/api/v1/birth/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Naissance supprimée");
      fetchBirths();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des Naissances</h1>

      {/* Formulaire */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md grid gap-4 mb-6"
      >
        <input
          type="text"
          name="babyName"
          placeholder="Nom du bébé"
          value={form.babyName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">-- Genre --</option>
          <option value="Garçon">Garçon</option>
          <option value="Fille">Fille</option>
        </select>
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="motherName"
          placeholder="Nom de la mère"
          value={form.motherName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="fatherName"
          placeholder="Nom du père"
          value={form.fatherName}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="weight"
          placeholder="Poids (kg)"
          value={form.weight}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="border p-2 rounded"
        ></textarea>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Mettre à jour" : "Ajouter"}
        </button>
      </form>

      {/* Tableau */}
      <div className="bg-white rounded shadow-md overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Nom bébé</th>
              <th className="p-2 border">Genre</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Mère</th>
              <th className="p-2 border">Père</th>
              <th className="p-2 border">Poids</th>
              <th className="p-2 border">Notes</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {births.map((b) => (
              <tr key={b._id}>
                <td className="p-2 border">{b.babyName}</td>
                <td className="p-2 border">{b.gender}</td>
                <td className="p-2 border">{new Date(b.birthDate).toLocaleDateString()}</td>
                <td className="p-2 border">{b.motherName}</td>
                <td className="p-2 border">{b.fatherName || "-"}</td>
                <td className="p-2 border">{b.weight} kg</td>
                <td className="p-2 border">{b.notes || "-"}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {births.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  Aucune naissance enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
