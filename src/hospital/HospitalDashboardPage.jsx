import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API from "@/axios/axios.js";
import dayjs from "dayjs";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { FiUsers, FiCalendar, FiUserCheck, FiBriefcase, FiDatabase, FiHeart, FiDroplet, FiActivity, FiSearch } from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
        {sub ? <p className="mt-1 text-xs text-gray-400">{sub}</p> : null}
      </div>
      <div className="inline-flex rounded-xl bg-emerald-50 p-3">
        <Icon className="h-6 w-6 text-emerald-600" />
      </div>
    </div>
  </div>
);

const Section = ({ title, action, children }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const FilterBar = ({ search, setSearch, from, setFrom, to, setTo }) => (
  <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher (nom, email, spécialité, motif...)"
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
    <input
      type="date"
      value={from}
      onChange={(e) => setFrom(e.target.value)}
      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
    />
    <input
      type="date"
      value={to}
      onChange={(e) => setTo(e.target.value)}
      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
    />
  </div>
);

const Tabs = ({ tabs, current, setCurrent }) => (
  <div className="mb-6 flex w-full overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
    {tabs.map((t) => (
      <button
        key={t.key}
        onClick={() => setCurrent(t.key)}
        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm transition ${
          current === t.key
            ? "bg-emerald-600 text-white"
            : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default function HospitalDashboard() {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  // filtres globaux
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [to, setTo] = useState(dayjs().endOf("month").format("YYYY-MM-DD"));
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/api/v1/dashboard");
        setPayload(data?.data || null);
      } catch (e) {
        console.error(e);
        setError("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const inRange = (dateStr) => {
    if (!dateStr) return true;
    const d = dayjs(dateStr);
    return (!from || d.isAfter(dayjs(from).subtract(1, "day"))) && (!to || d.isBefore(dayjs(to).add(1, "day")));
  };

  const normalized = useMemo(() => {
    if (!payload) return null;

    // Helpers de recherche
    const match = (txt) => (txt || "").toLowerCase().includes(search.toLowerCase());

    const doctors = payload.doctors.filter(
      (d) =>
        match(d.firstName) ||
        match(d.lastName) ||
        match(d.email) ||
        match(d.doctorDepartment)
    );

    const patients = payload.patients.filter(
      (p) => match(p.fullName) || match(p.email) || match(p.phone)
    );

    const appointments = payload.appointments
      .filter((a) => inRange(a.date))
      .filter((a) => match(a.reason));

    const nurses = payload.nurses.filter((n) => match(n.fullName) || match(n.email));

    const inventory = payload.inventory.filter(
      (i) => match(i.name) || match(i.category)
    );

    const accounting = payload.accounting.filter(
      (acc) => inRange(acc.date) && (match(acc.category) || match(acc.type) || match(acc.description))
    );

    const bloodStock = payload.bloodStock.filter((b) => match(b.bloodType));

    const deaths = payload.deaths
      .filter((d) => inRange(d.dateOfDeath))
      .filter((d) => match(d.patientName) || match(d.causeOfDeath) || match(d.responsiblePerson));

    // Agrégations graphiques
    const months = Array.from({ length: 12 }).map((_, i) =>
      dayjs().month(i).format("MMM")
    );

    const apptsPerMonth = Array(12).fill(0);
    appointments.forEach((a) => {
      const m = dayjs(a.date).month();
      apptsPerMonth[m] += 1;
    });

    let income = 0;
    let expense = 0;
    accounting.forEach((a) => {
      if (a.type === "income") income += a.amount || 0;
      if (a.type === "expense") expense += a.amount || 0;
    });

    const bloodByType = bloodStock.reduce((acc, b) => {
      acc[b.bloodType] = (acc[b.bloodType] || 0) + (b.quantity || 0);
      return acc;
    }, {});

    return {
      doctors,
      patients,
      appointments,
      nurses,
      inventory,
      accounting,
      bloodStock,
      deaths,
      charts: {
        months,
        apptsPerMonth,
        accounting: { income, expense },
        bloodByTypeLabels: Object.keys(bloodByType),
        bloodByTypeValues: Object.values(bloodByType),
      },
    };
  }, [payload, search, from, to]);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }
  if (error || !normalized) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
          {error || "Aucune donnée"}
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: "Aperçu" },
    { key: "doctors", label: "Médecins" },
    { key: "patients", label: "Patients" },
    { key: "appointments", label: "Rendez-vous" },
    { key: "nurses", label: "Infirmiers" },
    { key: "inventory", label: "Inventaire" },
    { key: "accounting", label: "Comptabilité" },
    { key: "blood", label: "Sang" },
    { key: "deaths", label: "Décès" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6">
      {/* Header */}
      <div className="mx-auto mb-6 max-w-7xl">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">Tableau de bord hôpital</h1>
          <p className="mt-1 text-sm text-gray-500">
            Vue d'ensemble et gestion : filtres temporels, recherche globale et onglets par section.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={FiUsers} label="Patients" value={normalized.patients.length} />
          <StatCard icon={FiBriefcase} label="Médecins" value={normalized.doctors.length} />
          <StatCard icon={FiCalendar} label="Rendez-vous (période)" value={normalized.appointments.length} />
          <StatCard
            icon={FiActivity}
            label="Solde (période)"
            value={(normalized.charts.accounting.income - normalized.charts.accounting.expense).toLocaleString() + " €"}
            sub={`+${normalized.charts.accounting.income.toLocaleString()} / -${normalized.charts.accounting.expense.toLocaleString()}`}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl">
        <Tabs tabs={tabs} current={tab} setCurrent={setTab} />

        {/* Filtres globaux */}
        <FilterBar search={search} setSearch={setSearch} from={from} setFrom={setFrom} to={to} setTo={setTo} />

        {/* CONTENT */}
        {tab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Section
              title="Rendez-vous par mois"
              action={<span className="text-xs text-gray-400">Filtré par dates</span>}
            >
              <Line
                data={{
                  labels: normalized.charts.months,
                  datasets: [
                    {
                      label: "Rendez-vous",
                      data: normalized.charts.apptsPerMonth,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </Section>

            <Section title="Revenus vs Dépenses (période)">
              <Bar
                data={{
                  labels: ["Revenus", "Dépenses"],
                  datasets: [
                    {
                      label: "Montant",
                      data: [
                        normalized.charts.accounting.income,
                        normalized.charts.accounting.expense,
                      ],
                    },
                  ],
                }}
                options={{
                  indexAxis: "y",
                  responsive: true,
                  plugins: { legend: { display: false } },
                }}
              />
            </Section>

            <Section title="Stock de sang par groupe">
              <Doughnut
                data={{
                  labels: normalized.charts.bloodByTypeLabels,
                  datasets: [
                    {
                      label: "Poches",
                      data: normalized.charts.bloodByTypeValues,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </Section>

            <Section title="Inventaire : faible stock" >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">Article</th>
                      <th className="py-2">Catégorie</th>
                      <th className="py-2">Qte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalized.inventory
                      .filter((i) => (i.quantity ?? 0) <= (i.minQuantity ?? 5))
                      .slice(0, 6)
                      .map((i) => (
                        <tr key={i._id} className="border-t">
                          <td className="py-2">{i.name}</td>
                          <td className="py-2 text-gray-500">{i.category || "-"}</td>
                          <td className="py-2">
                            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-rose-600">{i.quantity ?? 0}</span>
                          </td>
                        </tr>
                      ))}
                    {normalized.inventory.filter((i) => (i.quantity ?? 0) <= (i.minQuantity ?? 5)).length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">Rien à signaler 🎉</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Derniers décès (période et recherche)">
              <ul className="space-y-2">
                {normalized.deaths.slice(0, 6).map((d) => (
                  <li key={d._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{d.patientName}</p>
                      <p className="text-xs text-gray-500">{d.causeOfDeath} — {dayjs(d.dateOfDeath).format("DD/MM/YYYY")}</p>
                    </div>
                    <span className="rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600"><FiHeart className="inline -mt-0.5" /> décès</span>
                  </li>
                ))}
                {normalized.deaths.length === 0 && <p className="py-2 text-sm text-gray-500">Aucun décès sur la période.</p>}
              </ul>
            </Section>

            <Section title="Prochains rendez-vous">
              <ul className="space-y-2">
                {normalized.appointments
                  .filter((a) => dayjs(a.date).isAfter(dayjs()))
                  .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))
                  .slice(0, 6)
                  .map((a) => (
                    <li key={a._id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{dayjs(a.date).format("DD/MM/YYYY HH:mm")}</p>
                        <p className="text-xs text-gray-500">{a.reason || "—"}</p>
                      </div>
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700"><FiCalendar className="inline -mt-0.5" /> rdv</span>
                    </li>
                  ))}
                {normalized.appointments.length === 0 && <p className="py-2 text-sm text-gray-500">Aucun rendez-vous sur la période.</p>}
              </ul>
            </Section>
          </div>
        )}

        {tab === "doctors" && (
          <Section title="Médecins">
            <ListTable
              cols={["Nom", "Email", "Département", "Téléphone"]}
              rows={normalized.doctors.map((d) => [
                `${d.firstName || ""} ${d.lastName || ""}`.trim(),
                d.email || "-",
                d.doctorDepartment || "-",
                d.phone || "-",
              ])}
            />
          </Section>
        )}

        {tab === "patients" && (
          <Section title="Patients">
            <ListTable
              cols={["Nom", "Email", "Téléphone", "Créé le"]}
              rows={normalized.patients.map((p) => [
                p.fullName || "-",
                p.email || "-",
                p.phone || "-",
                p.createdAt ? dayjs(p.createdAt).format("DD/MM/YYYY") : "-",
              ])}
            />
          </Section>
        )}

        {tab === "appointments" && (
          <Section title="Rendez-vous">
            <ListTable
              cols={["Date", "Motif", "Patient", "Médecin", "Statut"]}
              rows={normalized.appointments
                .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf())
                .map((a) => [
                  a.date ? dayjs(a.date).format("DD/MM/YYYY HH:mm") : "-",
                  a.reason || "-",
                  a.patientName || "-",
                  a.doctorName || "-",
                  a.status || "-",
                ])}
            />
          </Section>
        )}

        {tab === "nurses" && (
          <Section title="Infirmiers">
            <ListTable
              cols={["Nom", "Email", "Téléphone", "Département"]}
              rows={normalized.nurses.map((n) => [
                n.fullName || "-",
                n.email || "-",
                n.phone || "-",
                n.department || "-",
              ])}
            />
          </Section>
        )}

        {tab === "inventory" && (
          <Section title="Inventaire">
            <ListTable
              cols={["Article", "Catégorie", "Quantité", "Min", "MAJ"]}
              rows={normalized.inventory.map((i) => [
                i.name || "-",
                i.category || "-",
                i.quantity ?? 0,
                i.minQuantity ?? 0,
                i.updatedAt ? dayjs(i.updatedAt).format("DD/MM/YYYY") : "-",
              ])}
            />
          </Section>
        )}

        {tab === "accounting" && (
          <Section title="Comptabilité (période)">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <Bar
                  data={{
                    labels: ["Revenus", "Dépenses"],
                    datasets: [
                      { label: "Montant", data: [normalized.charts.accounting.income, normalized.charts.accounting.expense] },
                    ],
                  }}
                  options={{ indexAxis: "y", plugins: { legend: { display: false } } }}
                />
              </div>
              <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <ListTable
                  compact
                  cols={["Date", "Type", "Catégorie", "Montant", "Description"]}
                  rows={normalized.accounting
                    .sort((a, b) => dayjs(b.date) - dayjs(a.date))
                    .map((acc) => [
                      acc.date ? dayjs(acc.date).format("DD/MM/YYYY") : "-",
                      acc.type || "-",
                      acc.category || "-",
                      (acc.amount || 0).toLocaleString() + " €",
                      acc.description || "-",
                    ])}
                />
              </div>
            </div>
          </Section>
        )}

        {tab === "blood" && (
          <Section title="Stock de sang">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <Doughnut
                  data={{
                    labels: normalized.charts.bloodByTypeLabels,
                    datasets: [{ data: normalized.charts.bloodByTypeValues }],
                  }}
                  options={{ plugins: { legend: { position: "bottom" } } }}
                />
              </div>
              <div className="lg:col-span-2">
                <ListTable
                  cols={["Groupe", "Quantité", "Expiration (si dispo)", "Créé le"]}
                  rows={normalized.bloodStock.map((b) => [
                    b.bloodType || "-",
                    b.quantity ?? 0,
                    b.expiryDate ? dayjs(b.expiryDate).format("DD/MM/YYYY") : "-",
                    b.createdAt ? dayjs(b.createdAt).format("DD/MM/YYYY") : "-",
                  ])}
                />
              </div>
            </div>
          </Section>
        )}

        {tab === "deaths" && (
          <Section title="Décès">
            <ListTable
              cols={["Nom", "Cause", "Date", "Responsable", "Notes"]}
              rows={normalized.deaths
                .sort((a, b) => dayjs(b.dateOfDeath) - dayjs(a.dateOfDeath))
                .map((d) => [
                  d.patientName || "-",
                  d.causeOfDeath || "-",
                  d.dateOfDeath ? dayjs(d.dateOfDeath).format("DD/MM/YYYY") : "-",
                  d.responsiblePerson || "-",
                  d.notes || "-",
                ])}
            />
          </Section>
        )}
      </div>
    </div>
  );
}

function ListTable({ cols, rows, compact = false }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full border-collapse text-sm ${compact ? "text-[13px]" : ""}`}>
        <thead>
          <tr className="border-b bg-gray-50 text-left text-gray-500">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                {r.map((cell, j) => (
                  <td key={j} className="px-3 py-2">{cell}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={cols.length} className="px-3 py-6 text-center text-gray-500">
                Aucun élément à afficher
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}