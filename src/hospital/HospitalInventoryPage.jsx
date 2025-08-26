import React, { useState, useEffect } from "react";
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
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchInventory = async () => {
    try {
      const { data } = await API.get("/api/v1/inventory");
      setItems(data.items || []);
    } catch (error) {
      console.error("Erreur fetchInventory:", error);
      toast.error("Erreur de chargement des items");
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/api/v1/inventory/stats");
      setStats(data);
    } catch (error) {
      console.error("Erreur fetchStats:", error);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const { data } = await API.get("/api/v1/inventory/low-stock");
      setLowStockItems(data.items || []);
    } catch (error) {
      console.error("Erreur fetchLowStockItems:", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchStats();
    fetchLowStockItems();
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
      if (formData[key] !== null && formData[key] !== undefined) {
        submitData.append(key, formData[key]);
      }
    }

    try {
      setLoading(true);
      await API.post("/api/v1/inventory/add", submitData, {
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
      fetchStats();
      fetchLowStockItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur ajout item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet item ?")) return;
    try {
      await API.delete(`/api/v1/inventory/${id}`);
      toast.success("Item supprimé !");
      fetchInventory();
      fetchStats();
      fetchLowStockItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const handleUpdateStock = async (id, action, quantity) => {
    try {
      await API.put(`/api/v1/inventory/${id}/stock`, {
        action,
        quantity: parseInt(quantity)
      });
      toast.success("Stock mis à jour !");
      fetchInventory();
      fetchStats();
      fetchLowStockItems();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur mise à jour stock");
    }
  };

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6">Inventaire Médical</h1>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-emerald-700">Total Items</h3>
            <p className="text-2xl font-bold">{stats.totalItems}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-emerald-700">Rupture de stock</h3>
            <p className="text-2xl font-bold text-red-600">{stats.lowStockTotal || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-emerald-700">Valeur totale</h3>
            <p className="text-2xl font-bold">{stats.totalValue?.toLocaleString() || 0} G</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-emerald-700">Médicaments</h3>
            <p className="text-2xl font-bold">{stats.medicineCount || 0}</p>
          </div>
        </div>
      )}

      {/* Alertes rupture de stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">⚠️ Alertes rupture de stock</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item._id} className="text-sm text-red-600">
                • {item.name} - {item.quantity} {item.unit} restant(s)
              </div>
            ))}
            {lowStockItems.length > 3 && (
              <div className="text-sm text-red-600">
                + {lowStockItems.length - 3} autre(s) item(s) en rupture...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 bg-white p-6 rounded-xl shadow">
        <input type="text" name="name" placeholder="Nom *" value={formData.name} onChange={handleChange} className="input" required />
        <select name="type" value={formData.type} onChange={handleChange} className="input">
          <option value="medicine">Médicament</option>
          <option value="supply">Fourniture</option>
          <option value="equipment">Équipement</option>
        </select>
        {formData.type === "medicine" && (
          <input type="text" name="subtype" placeholder="Type (sirop, pilule...)" value={formData.subtype} onChange={handleChange} className="input" />
        )}
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="input" />
        <input type="number" name="quantity" placeholder="Quantité *" value={formData.quantity} onChange={handleChange} className="input" min="0" required />
        <input type="text" name="unit" placeholder="Unité (boîte, sachet...)*" value={formData.unit} onChange={handleChange} className="input" required />
        <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className="input" />
        <input type="file" name="image" accept="image/*" onChange={handleChange} className="input" />
        <button type="submit" className="bg-emerald-600 text-white py-2 rounded-lg mt-4 col-span-full hover:bg-emerald-700 transition disabled:opacity-50" disabled={loading}>
          {loading ? "Ajout..." : "Ajouter à l'inventaire"}
        </button>
      </form>

      {/* Liste des items */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">Inventaire ({items.length} items)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white shadow rounded-xl overflow-hidden">
              <img src={item.image?.url || "/medicine.jpg"} alt={item.name} className="w-full h-40 object-cover" />
              <div className="p-4 space-y-2">
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
                <p className="text-xs text-gray-500 truncate">{item.description}</p>
                
                {/* Actions rapides stock */}
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleUpdateStock(item._id, 'add', 1)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleUpdateStock(item._id, 'remove', 1)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => openUpdateModal(item)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                  >
                    Modifier
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 mt-2 hover:underline text-sm block w-full text-left"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de modification */}
      {showUpdateModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Modifier {selectedItem.name}</h2>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Nouvelle quantité"
                className="w-full p-2 border rounded"
                onChange={(e) => setSelectedItem({...selectedItem, quantity: e.target.value})}
                value={selectedItem.quantity}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdateStock(selectedItem._id, 'set', selectedItem.quantity)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded"
                >
                  Valider
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun item dans l'inventaire</p>
          <p className="text-sm text-gray-400">Commencez par ajouter des médicaments ou fournitures</p>
        </div>
      )}
    </div>
  );
};

export default HospitalInventoryPage;