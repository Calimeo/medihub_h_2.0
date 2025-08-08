import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

const NurseManagementPage = () => {
  const [nurses, setNurses] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);

  

  useEffect(() => {
    fetchNurses();
  }, []);

  const fetchNurses = async () => {
    try {
      const res = await API.get("/api/v1/nurse");
      setNurses(res.data.nurses);
    } catch {
      toast.error("Erreur lors du chargement des infirmières.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error("Nom et Email requis");
    }

    try {
      if (editingId) {
        const res = await API.put(`/api/v1/nurse/${editingId}`, formData);
        toast.success(res.data.message);
      } else {
        const res = await API.post("/api/v1/nurse", formData);
        toast.success(res.data.message);
      }
      fetchNurses();
      setFormData({ name: "", email: "", phone: "" });
      setEditingId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur serveur.");
    }
  };

  const handleEdit = (nurse) => {
    setFormData({ name: nurse.name, email: nurse.email, phone: nurse.phone });
    setEditingId(nurse._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette infirmière ?")) return;
    try {
      const res = await API.delete(`/api/v1/nurse/${id}`);
      toast.success(res.data.message);
      fetchNurses();
    } catch {
      toast.error("Erreur suppression.");
    }
  };

  const togglePresence = async (id) => {
    try {
      const res = await API.patch(`/api/v1/nurse/${id}/presence/`);
      toast.success(res.data.message);
      fetchNurses();
    } catch {
      toast.error("Erreur mise à jour présence.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow space-y-10">
      <h1 className="text-3xl font-bold text-red-700 text-center">Gestion des Infirmières</h1>

      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          name="name"
          placeholder="Nom"
          value={formData.name}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          name="phone"
          placeholder="Téléphone"
          value={formData.phone}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
        <div className="col-span-2 flex gap-4">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
          >
            {editingId ? "Enregistrer" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFormData({ name: "", email: "", phone: "" });
              }}
              className="text-gray-600 hover:text-black"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold text-red-600 mb-4">Liste des infirmières</h2>
        <ul className="space-y-4">
          {nurses.map((n) => (
            <li
              key={n._id}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
            >
              <div>
                <p className="text-lg font-bold text-red-800">{n.name}</p>
                <p className="text-sm text-gray-600">{n.email} | {n.phone}</p>
                <p className={`text-sm ${n.present ? "text-green-600" : "text-gray-500"}`}>
                  {n.present ? "Présente" : "Absente"}
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(n)}
                  className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => togglePresence(n._id)}
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {n.present ? "Marquer absente" : "Marquer présente"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NurseManagementPage;
