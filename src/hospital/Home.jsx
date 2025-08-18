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
import { 
  FaUserNurse, 
  FaClinicMedical,
  FaBaby,
  FaHandHoldingWater
} from "react-icons/fa";
import { 
  BsCapsulePill,
  BsDroplet,
  BsHeartPulse
} from "react-icons/bs";
import { GiDeathSkull } from "react-icons/gi";
import { Context } from "../main";
import { toast } from "react-toastify";
import API from "@/axios/axios.js";

const links = [
  {
    to: "/hospital/dashboard",
    label: "Tableau de bord",
    icon: <MdDashboard className="text-4xl text-cyan-600" />,
    bgColor: "bg-cyan-50 hover:bg-cyan-100"
  },
  {
    to: "/hospital/services",
    label: "Services",
    icon: <MdMedicalServices className="text-4xl text-purple-600" />,
    bgColor: "bg-purple-50 hover:bg-purple-100"
  },
  {
    to: "/hospital/doctors",
    label: "Médecins",
    icon: <MdPeople className="text-4xl text-sky-600" />,
    bgColor: "bg-sky-50 hover:bg-sky-100"
  },
  {
    to: "/hospital/beds",
    label: "Lits & Chambres",
    icon: <MdHotel className="text-4xl text-yellow-500" />,
    bgColor: "bg-yellow-50 hover:bg-yellow-100"
  },
  {
    to: "/hospital/admissions",
    label: "Admissions / Sorties",
    icon: <MdAssignment className="text-4xl text-pink-500" />,
    bgColor: "bg-pink-50 hover:bg-pink-100"
  },
  {
    to: "/hospital/inventory",
    label: "Stocks & Fournitures",
    icon: <MdInventory className="text-4xl text-rose-500" />,
    bgColor: "bg-rose-50 hover:bg-rose-100"
  },
  {
    to: "/hospital/nurse",
    label: "Infirmières",
    icon: <FaUserNurse className="text-4xl text-green-600" />,
    bgColor: "bg-green-50 hover:bg-green-100"
  },
  {
    to: "/pharmacy",
    label: "Pharmacie",
    icon: <BsCapsulePill className="text-4xl text-indigo-600" />,
    bgColor: "bg-indigo-50 hover:bg-indigo-100"
  },
  {
    to: "/accounting",
    label: "Comptabilité",
    icon: <MdPointOfSale className="text-4xl text-emerald-600" />,
    bgColor: "bg-emerald-50 hover:bg-emerald-100"
  },
  {
    to: "/add/patient",
    label: "Ajouter un patient",
    icon: <MdPersonAdd className="text-4xl text-blue-500" />,
    bgColor: "bg-blue-50 hover:bg-blue-100"
  },
  {
    to: "/list/patient",
    label: "Liste des patients",
    icon: <MdListAlt className="text-4xl text-teal-500" />,
    bgColor: "bg-teal-50 hover:bg-teal-100"
  },
  {
    to: "/blood/stock",
    label: "Don de Sang",
    icon: <BsDroplet className="text-4xl text-red-500" />,
    bgColor: "bg-red-50 hover:bg-red-100"
  },
  {
    to: "/death",
    label: "Décès",
    icon: <GiDeathSkull className="text-4xl text-gray-700" />,
    bgColor: "bg-gray-50 hover:bg-gray-100"
  },
  {
    to: "/birth",
    label: "Naissances",
    icon: <FaBaby className="text-4xl text-pink-400" />,
    bgColor: "bg-pink-50 hover:bg-pink-100"
  },
  {
    to: "/emergency",
    label: "Urgences",
    icon: <BsHeartPulse className="text-4xl text-red-600" />,
    bgColor: "bg-red-50 hover:bg-red-100"
  },
  {
    to: "/doctor/get",
    label: "Docteur",
    icon: <FaClinicMedical className="text-4xl text-amber-600" />,
    bgColor: "bg-amber-50 hover:bg-amber-100"
  },
  {
    to: "/dialysis",
    label: "Dialyse",
    icon: <FaHandHoldingWater className="text-4xl text-blue-400" />,
    bgColor: "bg-blue-50 hover:bg-blue-100"
  }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
          Bienvenue {hospital?.name ? `à ${hospital.name}` : "à votre Hôpital"}
        </h1>
        <p className="text-gray-600 text-lg mt-3 max-w-2xl mx-auto">
          Gérez efficacement votre établissement de santé avec notre suite complète d'outils médicaux.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
        {links.map(({ to, label, icon, bgColor }, index) => (
          <Link
            key={index}
            to={to}
            className={`${bgColor} rounded-xl p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-200`}
          >
            <div className="p-3 rounded-full bg-white shadow-inner mb-3">
              {icon}
            </div>
            <span className="mt-2 text-gray-800 font-medium text-sm text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="text-center mt-16">
        <button
          onClick={logoutHandler}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition duration-300"
        >
          <MdLogout className="text-xl" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Home;