import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "@/axios/axios.js";

export default function HospitalServicesPage() {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Récupérer les services depuis le backend
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get("/api/v1/service");
      setServices(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des services", err);
    }
  };

  function resetForm() {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setError("");
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Le nom du service est requis.");
      return;
    }

    try {
      if (editingId) {
        // Modifier un service
        await API.put(`/api/v1/service/${editingId}`, formData);
      } else {
        // Ajouter un nouveau service
        await API.post("/api/v1/service", formData);
      }
      fetchServices();
      resetForm();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du service :", err);
      setError("Une erreur est survenue.");
    }
  }

  async function handleEdit(id) {
    const service = services.find((s) => s._id === id);
    if (service) {
      setFormData({ name: service.name, description: service.description });
      setEditingId(id);
      setError("");
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      try {
        await API.delete(`/api/v1/service/${id}`);
        fetchServices();
        if (editingId === id) resetForm();
      } catch (err) {
        console.error("Erreur lors de la suppression :", err);
      }
    }
  }

  return (
  <div className="max-w-6xl mx-auto p-6 md:p-10 bg-white rounded-2xl shadow-lg space-y-14">
    <h1 className="text-4xl font-bold text-center text-red-700 tracking-tight">🩺 Gestion des services hospitaliers</h1>

    {/* Liste des services */}
    <section>
      <h2 className="text-2xl font-semibold text-red-600 mb-6">📋 Liste des services disponibles</h2>
      {services.length === 0 ? (
        <p className="text-gray-500 italic">Aucun service disponible pour le moment.</p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-6">
          {services.map(({ _id, name, description }) => (
            <li
              key={_id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-red-800">{name}</h3>
                <p className="text-gray-600 mt-1">{description || "Pas de description."}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleEdit(_id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(_id)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg text-sm font-medium transition"
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>

    {/* Formulaire */}
    <section>
      <h2 className="text-2xl font-semibold text-red-600 mb-6">
        {editingId ? "✏️ Modifier un service" : "➕ Ajouter un nouveau service"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
            Nom du service <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex : Gynécologie"
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Décrivez les missions de ce service..."
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-red-600 font-semibold text-center">{error}</p>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition disabled:bg-red-300"
            disabled={!formData.name.trim()}
          >
            {editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-800 font-semibold"
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </section>
  </div>
);
}
