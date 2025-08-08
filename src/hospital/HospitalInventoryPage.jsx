import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

const HospitalInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "medicine",
    subtype: "",
    description: "",
    quantity: 0,
    unit: "boîte",
    expirationDate: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    try {
      const { data } = await API.get("/api/v1/inventory");
      setItems(data.items);
    } catch (error) {
      toast.error("Erreur de chargement des items");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.quantity || !formData.unit) {
      return toast.warn("Veuillez remplir les champs obligatoires.");
    }

    const submitData = new FormData();
    for (let key in formData) {
      if (formData[key]) submitData.append(key, formData[key]);
    }

    try {
      setLoading(true);
      await API.post("/api/v1/inventory/add", submitData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Item ajouté !");
      setFormData({
        name: "",
        type: "medicine",
        subtype: "",
        description: "",
        quantity: 0,
        unit: "boîte",
        expirationDate: "",
        image: null,
      });
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur ajout item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet item ?")) return;
    try {
      await axios.delete(`/api/v1/inventory/${id}`, {
        withCredentials: true,
      });
      toast.success("Item supprimé !");
      fetchInventory();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Inventaire Médical</h1>

      {/* Formulaire ajout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 bg-white p-6 rounded-xl shadow">
        <input type="text" name="name" placeholder="Nom" value={formData.name} onChange={handleChange} className="input" required />
        <select name="type" value={formData.type} onChange={handleChange} className="input">
          <option value="medicine">Médicament</option>
          <option value="supply">Fourniture</option>
        </select>
        {formData.type === "medicine" && (
          <input type="text" name="subtype" placeholder="Type (sirop, pilule...)" value={formData.subtype} onChange={handleChange} className="input" />
        )}
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="input" />
        <input type="number" name="quantity" placeholder="Quantité" value={formData.quantity} onChange={handleChange} className="input" required />
        <input type="text" name="unit" placeholder="Unité (boîte, sachet...)" value={formData.unit} onChange={handleChange} className="input" />
        <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="input" />
        <input type="file" name="image" accept="image/*" onChange={handleChange} className="input" />
        <button type="submit" className="bg-emerald-600 text-white py-2 rounded-lg mt-4 col-span-full hover:bg-emerald-700 transition">
          {loading ? "Ajout..." : "Ajouter"}
        </button>
      </form>

      {/* Liste des items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white shadow rounded-xl overflow-hidden">
            <img src={item.image?.url || "/medicine.jpg"} alt={item.name} className="w-full h-40 object-cover" />
            <div className="p-4 space-y-1">
              <h3 className="text-xl font-bold text-emerald-700">{item.name}</h3>
              <p className="text-sm text-gray-700">
                <strong>Type:</strong> {item.type} {item.subtype && `- ${item.subtype}`}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Quantité:</strong> {item.quantity} {item.unit}
              </p>
              {item.expirationDate && (
                <p className="text-sm text-red-500">
                  <strong>Péremption:</strong> {new Date(item.expirationDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-xs text-gray-500">{item.description}</p>
              <button
                onClick={() => handleDelete(item._id)}
                className="text-red-600 mt-2 hover:underline text-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalInventoryPage;
