import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Download, Plus } from "lucide-react";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API from "@/axios/axios.js";

export default function AccountingPage() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });
  const [formData, setFormData] = useState({ type: "income", category: "", amount: "", date: "", description: "" });

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/api/v1/accounting/my-entries");
      setTransactions(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des transactions");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredTransactions = transactions.filter((t) => {
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;
    const date = new Date(t.date);
    return (
      (!filters.type || t.type === filters.type) &&
      (!filters.category || t.category.toLowerCase().includes(filters.category.toLowerCase())) &&
      (!start || date >= start) &&
      (!end || date <= end)
    );
  });

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) return toast.error("Montant invalide");
    try {
      await API.post("/api/v1/accounting/add", formData);
      toast.success("Transaction ajoutée");
      setFormData({ type: "income", category: "", amount: "", date: "", description: "" });
      fetchTransactions();
    } catch (err) {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTransactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  const totalIncome = filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const monthlyData = Array.from({ length: 12 }, (_, month) => {
    const revenues = filteredTransactions
      .filter((t) => new Date(t.date).getMonth() === month && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter((t) => new Date(t.date).getMonth() === month && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: new Date(2023, month).toLocaleString("fr-FR", { month: "short" }),
      revenus: revenues,
      depenses: expenses,
    };
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Comptabilité</h2>

      {/* Filtres */}
      <div className="grid md:grid-cols-4 gap-4 mb-4">
        <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 rounded border">
          <option value="">Type</option>
          <option value="income">Revenu</option>
          <option value="expense">Dépense</option>
        </select>
        <input type="text" name="category" placeholder="Catégorie" value={filters.category} onChange={handleFilterChange} className="p-2 rounded border" />
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 rounded border" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 rounded border" />
        <button onClick={() => setFilters({ type: "", category: "", startDate: "", endDate: "" })} className="col-span-4 bg-gray-200 p-2 rounded">Réinitialiser les filtres</button>
      </div>

      {/* Totaux */}
      <div className="flex gap-4 mb-4">
        <div className="bg-green-100 text-green-800 p-4 rounded shadow w-full">Total Revenus: {totalIncome} $</div>
        <div className="bg-red-100 text-red-800 p-4 rounded shadow w-full">Total Dépenses: {totalExpense} $</div>
      </div>

      {/* Graphique */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Revenus vs Dépenses par mois</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={monthlyData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="depenses" barSize={20} fill="#EF4444" name="Dépenses" />
            <Line type="monotone" dataKey="revenus" stroke="#10B981" name="Revenus" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau */}
      <div className="overflow-auto max-h-[300px] mb-4">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Catégorie</th>
              <th className="p-2">Montant</th>
              <th className="p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t._id} className="border-b">
                <td className="p-2">{format(new Date(t.date), "yyyy-MM-dd")}</td>
                <td className="p-2 capitalize">{t.type}</td>
                <td className="p-2">{t.category}</td>
                <td className="p-2">{t.amount} $</td>
                <td className="p-2">{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleAddTransaction} className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded shadow">
        <select name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="p-2 border rounded">
          <option value="income">Revenu</option>
          <option value="expense">Dépense</option>
        </select>
        <input type="text" placeholder="Catégorie" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="p-2 border rounded" required />
        <input type="number" placeholder="Montant" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} className="p-2 border rounded" required />
        <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="p-2 border rounded" required />
        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="p-2 border rounded md:col-span-2" rows="2" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded flex items-center gap-2 hover:bg-blue-700">
          <Plus size={16} /> Ajouter
        </button>
        <button onClick={handleExportExcel} type="button" className="bg-green-600 text-white p-2 rounded flex items-center gap-2 hover:bg-green-700">
          <Download size={16} /> Exporter Excel
        </button>
      </form>
    </div>
  );
}
