import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Context } from "./main";


// Import des pages
import Login from "./hospital/login.jsx";
import Home from "./hospital/Home.jsx";
import HospitalDashboard from "./hospital/HospitalDashboardPage";
import ServiceManagement from "./hospital/HospitalServicesPage";
import HospitalDoctorsPage from "./hospital/HospitalDoctorsPage";
import HospitalBedsPage from "./hospital/HospitalBedsPage";
import AdmissionManagement from "./hospital/HospitalAdmissionsPage";
import HospitalInventoryPage from "./hospital/HospitalInventoryPage";
import NurseManagementPage from "./hospital/nurseControllePage";
import HospitalDoctors from "./hospital/hopitalDoctor.jsx";
import HospitalPharmacyPage from "./hospital/HospitalPharmacyPage.jsx";
import AccountingPage from "./hospital/AccountingPage.jsx";
import PatientsListPage from "./hospital/ListPatient.jsx";
import AddPatientForm from "./hospital/Addpatient.jsx";
import API from "@/axios/axios.js";
import BloodStockPage from "./hospital/BloodStockPage.jsx";
import DeathPage from "./hospital/DeathPage.jsx";
import BirthPage from "./hospital/birthPage.jsx";
import NurseShiftsPage from './hospital/NurseShiftsPage.jsx';
import LaboratoryManagement from "./hospital/laboratoire.jsx";
import HospitalRoomManagement from "./hospital/hopitalRoomManager.jsx";


// Composant route protégée
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(Context);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const { isAuthenticated, setIsAuthenticated, hospital, setHospital } = useContext(Context);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get("/api/v1/user/hospital/me", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setHospital(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setHospital({});
      } finally {
        setLoading(false); // Important !
      }
    };

    fetchUser();
  }, [setIsAuthenticated, setHospital]);

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-8 px-4 min-h-[calc(100vh-64px)]">
          <Routes>
            {/* Page d'accueil redirige vers login */}
            <Route path="/" element={<Navigate to="/hospital/home" replace />} />

            {/* Page login */}
            <Route path="/login" element={<Login />} />

            {/* Routes protégées */}
            <Route path="/hospital/home" element={
              <PrivateRoute><Home /></PrivateRoute>
            } />
            <Route path="/hospital/dashboard" element={
              <PrivateRoute><HospitalDashboard /></PrivateRoute>
            } />
            <Route path="/hospital/services" element={
              <PrivateRoute><ServiceManagement /></PrivateRoute>
            } />
            <Route path="/hospital/doctors" element={
              <PrivateRoute><HospitalDoctorsPage /></PrivateRoute>
            } />
            <Route path="/hospital/beds" element={
              <PrivateRoute><HospitalBedsPage /></PrivateRoute>
            } />
            <Route path="/hospital/admissions" element={
              <PrivateRoute><AdmissionManagement /></PrivateRoute>
            } />
            <Route path="/hospital/inventory" element={
              <PrivateRoute><HospitalInventoryPage /></PrivateRoute>
            } />
             <Route path="/hospital/nurse" element={
              <PrivateRoute><NurseManagementPage /></PrivateRoute>
            } />
             {/* <Route path="/hospital/all" element={<HospitalDoctorsPage />} /> */}
             <Route path="/pharmacy" element={<HospitalPharmacyPage />} />
             <Route path="/accounting" element={<AccountingPage />} />
             <Route path="/list/patient" element={<PatientsListPage />} />
             <Route path="/add/patient" element={<AddPatientForm />} />
             <Route path="/blood/stock" element={<BloodStockPage />} />
             <Route path="/birth" element={<BirthPage />} />
             <Route path="/death" element={<DeathPage />} />
             <Route path="/doctor/get" element={<HospitalDoctors />} />
             <Route path="/labo" element={<LaboratoryManagement />} />
             <Route path="/rooms/management"element={<HospitalRoomManagement />} />
            {/* Catch-all : redirection vers login si route inconnue */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            <Route path="/nurses/shifts" element={<NurseShiftsPage />} />
          </Routes>
          <ToastContainer />
        </main>
      </div>
    </Router>
  );
};

export default App;
