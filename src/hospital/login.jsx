import React, { useContext, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main.jsx";
import API from "@/axios/axios.js";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post(
        "/api/v1/user/login",
        { email, password, role: "Hospital" },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const token = res.data.token;

      if (token) {
        localStorage.setItem("token", token); // ✅ Save JWT
        setIsAuthenticated(true);
        toast.success(res.data.message);
        navigateTo("/");
        setEmail("");
        setPassword("");
      } else {
        toast.error("Token manquant dans la réponse du serveur.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/" />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-100 p-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">
        {/* Logo & Heading */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="MediLink Logo" className="w-20 h-20 mb-2" />
          <h1 className="text-2xl font-bold text-teal-700">
            Welcome to MediLink
          </h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            Only Hospitals are allowed to access these resources.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="email@medilink.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-teal-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-teal-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={loading}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md transition duration-300 font-medium
                        text-white shadow-sm ${
                          loading
                            ? "bg-teal-400 cursor-not-allowed"
                            : "bg-teal-600 hover:bg-teal-700"
                        }`}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
