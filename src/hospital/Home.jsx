import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdMedicalServices,
  MdPeople,
  MdHotel,
  MdAssignment,
  MdLogout,
  MdInventory,
  MdPointOfSale,
  MdPersonAdd,
  MdListAlt,
} from "react-icons/md";
import { FaUserNurse } from "react-icons/fa";
import { BsCapsulePill } from "react-icons/bs";
import { Context } from "../main";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

const links = [
  {
    to: "/hospital/dashboard",
    label: "Tableau de bord",
    icon: <MdDashboard className="text-4xl text-cyan-600" />,
  },
  {
    to: "/hospital/services",
    label: "Services",
    icon: <MdMedicalServices className="text-4xl text-purple-600" />,
  },
  {
    to: "/hospital/doctors",
    label: "Médecins",
    icon: <MdPeople className="text-4xl text-sky-600" />,
  },
  {
    to: "/hospital/beds",
    label: "Lits & Chambres",
    icon: <MdHotel className="text-4xl text-yellow-500" />,
  },
  {
    to: "/hospital/admissions",
    label: "Admissions / Sorties",
    icon: <MdAssignment className="text-4xl text-pink-500" />,
  },
  {
    to: "/hospital/inventory",
    label: "Stocks & Fournitures",
    icon: <MdInventory className="text-4xl text-rose-500" />,
  },
  {
    to: "/hospital/nurse",
    label: "Infirmières",
    icon: <FaUserNurse className="text-4xl text-green-600" />,
  },
  {
    to: "/pharmacy",
    label: "Pharmacie",
    icon: <BsCapsulePill className="text-4xl text-indigo-600" />,
  },
  {
    to: "/accounting",
    label: "Comptabilité",
    icon: <MdPointOfSale className="text-4xl text-emerald-600" />,
  },
  {
    to: "/add/patient",
    label: "Ajouter un patient",
    icon: <MdPersonAdd className="text-4xl text-emerald-500" />,
  },
  {
    to: "/list/patient",
    label: "Liste des patients",
    icon: <MdListAlt className="text-4xl text-emerald-500" />,
  },
];

const Home = () => {
  const { hospital, setHospital } = useContext(Context);
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await API.get("/api/v1/user/hospital/logout", { withCredentials: true });
      setHospital(null);
      localStorage.removeItem("hospitalToken");
      toast.success("Déconnexion réussie.");
      navigate("/login");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Bienvenue {hospital?.name ? `à ${hospital.name}` : "à votre Hôpital"}
        </h1>
        <p className="text-gray-600 text-lg mt-3">
          Gérez efficacement votre hôpital avec les outils ci-dessous.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {links.map(({ to, label, icon }, index) => (
          <Link
            key={index}
            to={to}
            className="bg-white hover:bg-teal-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
          >
            {icon}
            <span className="mt-4 text-gray-800 font-semibold text-sm text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={logoutHandler}
          className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
        >
          <MdLogout className="text-2xl" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Home;
