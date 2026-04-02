import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getRequest } from "../../Helpers";

// ── Design tokens ────────────────────────────────────────────────────────────
const NAVY = "#042954";
const GOLD = "#fabf22";
const TEAL = "#0d9488";
const CORAL = "#f97316";
const SLATE = "#64748b";
const BG = "#f8fafc";

const PIE_COLORS = [NAVY, GOLD, TEAL, CORAL, "#8b5cf6"];

// ── Micro stat card ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, accent, icon, delay = 0 }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: "22px 24px",
      borderLeft: `4px solid ${accent}`,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      animation: `fadeUp 0.5s ease both`,
      animationDelay: `${delay}ms`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Background accent blob */}
    <div
      style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: accent,
        opacity: 0.08,
      }}
    />
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: SLATE,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 32,
        fontWeight: 800,
        color: NAVY,
        lineHeight: 1,
        fontFamily: "'Georgia', serif",
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{sub}</div>
    )}
  </div>
);

// ── Section heading ──────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}
  >
    <div
      style={{ width: 3, height: 18, backgroundColor: GOLD, borderRadius: 2 }}
    />
    <span
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: NAVY,
        letterSpacing: "-0.2px",
      }}
    >
      {children}
    </span>
  </div>
);

// ── Chart card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, children, style = {} }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: "22px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      ...style,
    }}
  >
    <SectionTitle>{title}</SectionTitle>
    {children}
  </div>
);

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: NAVY,
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      {label && (
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ color: GOLD, fontWeight: 700, fontSize: 15 }}>
          {typeof p.value === "number" &&
          p.name?.toLowerCase().includes("revenue")
            ? `₹${p.value.toLocaleString("en-IN")}`
            : p.value}
        </div>
      ))}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRequest("dashboard")
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!data) return null;

  // ── Chart data transforms ─────────────────────────────────────────────────
  const admissionChartData = [
    { name: "Today", value: data.admissions?.today ?? 0 },
    { name: "This Month", value: data.admissions?.thisMonth ?? 0 },
    { name: "Total", value: data.admissions?.total ?? 0 },
  ];

  const genderChartData = (data.genderStats || []).map((g) => ({
    name: g._id || "Unknown",
    value: g.count,
  }));

  // Monthly trend — use monthlyAdmissions if available, else synthesize
  const monthlyData = data.monthlyAdmissions || [
    { month: "Jan", admissions: 0 },
    { month: "Feb", admissions: 0 },
    { month: "Mar", admissions: 0 },
  ];

  return (
    <>
      {/* Inject keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          padding: "28px 28px 40px",
          backgroundColor: BG,
          minHeight: "100vh",
        }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 28, animation: "fadeIn 0.4s ease both" }}>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: NAVY,
              fontFamily: "'Georgia', serif",
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", color: SLATE, fontSize: 13 }}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* ── KPI cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <StatCard
            label="Total Admissions"
            value={data.admissions?.total ?? 0}
            sub="All time"
            accent={NAVY}
            delay={0}
          />
          <StatCard
            label="Today's Admissions"
            value={data.admissions?.today ?? 0}
            sub="As of now"
            accent={GOLD}
            delay={60}
          />
          <StatCard
            label="This Month"
            value={data.admissions?.thisMonth ?? 0}
            sub="Month to date"
            accent={TEAL}
            delay={120}
          />
          <StatCard
            label="Doctors"
            value={data.users?.doctors ?? 0}
            sub="On staff"
            accent={CORAL}
            delay={180}
          />
          <StatCard
            label="Total Revenue"
            value={`₹${(data.revenue?.total ?? 0).toLocaleString("en-IN")}`}
            sub="Billed amount"
            accent="#8b5cf6"
            delay={240}
          />
        </div>

        {/* ── Charts row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
            animation: "fadeUp 0.6s ease 0.2s both",
          }}
        >
          {/* Area chart — monthly trend */}
          <ChartCard title="Monthly Admissions Trend">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={monthlyData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={NAVY} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: SLATE, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: SLATE, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="admissions"
                  stroke={NAVY}
                  strokeWidth={2.5}
                  fill="url(#admGrad)"
                  dot={{ fill: NAVY, r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: GOLD, stroke: NAVY, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Bar chart — admissions overview */}
          <ChartCard title="Admissions Overview">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={admissionChartData}
                margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                barSize={40}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: SLATE, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: SLATE, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(4,41,84,0.04)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {admissionChartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? GOLD : i === 1 ? TEAL : NAVY}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* ── Bottom row ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.6fr",
            gap: 20,
            animation: "fadeUp 0.6s ease 0.35s both",
          }}
        >
          {/* Pie — gender */}
          <ChartCard title="Gender Distribution">
            {genderChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={genderChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {genderChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [val, name]}
                    contentStyle={{
                      backgroundColor: NAVY,
                      border: "none",
                      borderRadius: 10,
                      color: GOLD,
                      fontWeight: 700,
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: SLATE, paddingTop: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: SLATE,
                  padding: "40px 0",
                  fontSize: 13,
                }}
              >
                No gender data available
              </div>
            )}
          </ChartCard>

          {/* Recent admissions */}
          <ChartCard title="Recent Admissions">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {(data.recentAdmissions || []).slice(0, 6).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "11px 0",
                    borderBottom: i < 5 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {item.patientName?.charAt(0)?.toUpperCase() || "P"}
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 600, color: NAVY, fontSize: 14 }}
                      >
                        {item.patientName}
                      </div>
                      <div style={{ fontSize: 12, color: SLATE, marginTop: 1 }}>
                        {item.age} yrs
                        {item.gender && <> · {item.gender}</>}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    {item.status && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20,
                          textTransform: "capitalize",
                          backgroundColor:
                            item.status === "admitted"
                              ? "#f0fdf4"
                              : item.status === "discharged"
                                ? "#f8fafc"
                                : item.status === "pending"
                                  ? "#fffbeb"
                                  : "#f0f9ff",
                          color:
                            item.status === "admitted"
                              ? TEAL
                              : item.status === "discharged"
                                ? SLATE
                                : item.status === "pending"
                                  ? "#b45309"
                                  : "#0369a1",
                        }}
                      >
                        {item.status}
                      </span>
                    )}
                    {item.createdAt && (
                      <div
                        style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}
                      >
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {(!data.recentAdmissions ||
                data.recentAdmissions.length === 0) && (
                <div
                  style={{
                    textAlign: "center",
                    color: SLATE,
                    padding: "30px 0",
                    fontSize: 13,
                  }}
                >
                  No recent admissions
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
