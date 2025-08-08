// frontend/src/pages/HospitalPharmacyPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

const HospitalPharmacyPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    expiryDate: "",
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.get("/api/v1/product/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(data.products);
    } catch (err) {
      toast.error("Erreur lors du chargement des produits");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { data } = await API.post("/api/v1/product/add", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(data.message);
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        expiryDate: "",
      });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-emerald-700 mb-4">Produits de la Pharmacie</h2>

      {/* Formulaire d'ajout */}
      <form
        onSubmit={handleAddProduct}
        className="bg-white shadow-md rounded p-6 mb-8 space-y-4"
      >
        <h3 className="text-lg font-semibold mb-2">Ajouter un produit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nom du produit"
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Prix"
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Catégorie"
            className="border p-2 rounded"
          />
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </form>

      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="border p-4 bg-white rounded shadow flex flex-col"
          >
            <h4 className="text-lg font-semibold">{product.name}</h4>
            <p className="text-sm text-gray-500">{product.description}</p>
            <p className="mt-2 text-emerald-600 font-bold">${product.price}</p>
            <p className="text-sm">Stock : {product.stock}</p>
            <p className="text-sm">Catégorie : {product.category}</p>
            {product.expiryDate && (
              <p className="text-sm">Expire le : {product.expiryDate.slice(0, 10)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalPharmacyPage;
