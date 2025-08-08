import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { PlusIcon } from "@heroicons/react/24/outline";
import API from "@/axios/axios.js";

const HospitalDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token manquant. Veuillez vous reconnecter.");
        return;
      }

      const { data } = await API.get(
        "/api/v1/user/hospital/doctors",
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setDoctors(data.doctors || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-emerald-700">
          Médecins de l'hôpital
        </h1>
        <button
          onClick={() => navigate("/hospital/add-doctor")}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition"
        >
          Ajouter un médecin
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-400 italic">
          Aucun médecin trouvé pour cet hôpital.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={doc.docAvatar?.url || "/avatar.png"}
                alt="doctor"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Dr. {doc.firstName} {doc.lastName}
                </h3>
                <p className="text-gray-600 text-sm">{doc.email}</p>
                <p className="text-gray-600 text-sm">📞 {doc.phone}</p>
                <p className="text-sm mt-2 text-indigo-600 font-medium">
                  Département : {doc.doctorDepartment || "Non spécifié"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalDoctorsPage;
