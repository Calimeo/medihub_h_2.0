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
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await API.get("/api/v1/product/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProducts(data.products);
    } catch (err) {
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification de la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La taille de l'image ne doit pas dépasser 5MB");
      return;
    }

    // Vérification du type de fichier
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      toast.error("Seuls les formats JPEG, JPG et PNG sont acceptés");
      return;
    }

    try {
      setIsUploadingImage(true);
      
      // Création d'un FormData pour l'upload
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const { data } = await API.post("/api/v1/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Mise à jour du formulaire avec les données de l'image
      setForm(prev => ({
        ...prev,
        image: {
          public_id: data.public_id,
          url: data.secure_url
        }
      }));

      // Créer une preview de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      toast.success("Image téléchargée avec succès");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'upload de l'image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Validation des champs obligatoires
      if (!form.name || !form.price || !form.stock || !form.category) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (isNaN(form.price) || form.price <= 0) {
        throw new Error("Le prix doit être un nombre positif");
      }

      if (isNaN(form.stock) || form.stock < 0) {
        throw new Error("Le stock doit être un nombre positif ou nul");
      }

      const { data } = await API.post("/api/v1/product/add", form, {
        headers: {
          Authorization: `Bearer ${token}`,
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
        image: null
      });
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-emerald-700 mb-8 text-center">Gestion de la Pharmacie</h2>

      {/* Formulaire d'ajout */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-10">
        <div className="p-6 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-xl font-semibold text-emerald-800">Ajouter un nouveau produit</h3>
        </div>
        <form onSubmit={handleAddProduct} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Paracétamol 500mg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description du produit..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (gdes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="9.99"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="100"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Antidouleurs"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image du produit</label>
                <div className="mt-1 flex items-center gap-4">
                  <label className="cursor-pointer">
                    <span className={`inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploadingImage ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Upload en cours...
                        </>
                      ) : "Choisir une image"}
                    </span>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/jpg, image/png" 
                      onChange={handleImageChange}
                      className="sr-only"
                      disabled={isUploadingImage}
                    />
                  </label>
                  
                  {(imagePreview || form.image?.url) && (
                    <div className="relative">
                      <img 
                        src={imagePreview || form.image.url} 
                        alt="Preview" 
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Supprimer l'image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">JPEG, JPG, PNG (max 5MB)</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  En cours...
                </span>
              ) : "Ajouter le produit"}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des produits */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Inventaire de la pharmacie</h3>
          <p className="text-sm text-gray-500">{products.length} produits au total</p>
        </div>
        
        {isLoading && products.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Aucun produit disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  {product.image?.url ? (
                    <img 
                      src={product.image.url} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-bold text-gray-900 truncate">{product.name}</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {product.price} gdes
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className={`flex items-center ${product.stock <= 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-500' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {product.stock} en stock
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {product.category || "Non classé"}
                    </div>
                  </div>
                  
                  {product.expiryDate && (
                    <div className={`mt-3 flex items-center text-sm ${new Date(product.expiryDate) < new Date() ? 'text-red-500' : 'text-amber-600'}`}>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(product.expiryDate) < new Date() ? 'Expiré le ' : 'Expire le '}
                      {new Date(product.expiryDate).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalPharmacyPage;