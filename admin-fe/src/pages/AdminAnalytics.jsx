import React, { useEffect, useMemo, useState } from "react";
import axios from "../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./AdminAnalytics.css";

const PERIODS = [
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "12 tháng", value: "12m" },
];

const STATUS_LABELS = {
  confirmed: "Đã xác nhận",
  cho_xu_ly: "Chờ xử lý",
  processing: "Đang xử lý",
  on_hold: "Tạm giữ",
  delivered: "Đã giao",
  failed_delivery: "Giao thất bại",
  cancelled_by_customer: "Khách hủy",
  cancelled_by_admin: "Admin hủy",
};

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#94a3b8",
  "#fb7185",
];

function formatCurrency(v) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
}

function formatNumber(v) {
  return (v ?? 0).toLocaleString("vi-VN");
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [kpis, setKpis] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { period };
      const [overview, revenue, orders, top] = await Promise.all([
        axios.get("/admin/dashboard/overview"),
        axios.get("/admin/dashboard/revenue-chart", { params }),
        axios.get("/admin/dashboard/order-stats"),
        axios.get("/admin/dashboard/top-products", { params: { limit: 8 } }),
      ]);

      if (overview.data?.success) setKpis(overview.data.data);
      if (revenue.data?.success) setRevenueSeries(revenue.data.data?.chart || []);
      if (orders.data?.success) setOrderStatus(orders.data.data || []);
      if (top.data?.success) setTopProducts(top.data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Lỗi tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const orderStatusBarData = useMemo(() => {
    return orderStatus.map((s) => ({
      status: STATUS_LABELS[s.status] || s.status || "Khác",
      count: s.count || 0,
    }));
  }, [orderStatus]);

  const topProductsPie = useMemo(() => {
    const total = (topProducts || []).reduce((acc, p) => acc + (p.totalRevenue || 0), 0) || 1;
    return (topProducts || []).map((p, idx) => ({
      name: p.name,
      value: p.totalRevenue || 0,
      percent: ((p.totalRevenue || 0) / total) * 100,
      color: COLORS[idx % COLORS.length],
    }));
  }, [topProducts]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading">
          <div className="spinner" />
          <span>Đang tải thống kê...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error">
          <span>{error}</span>
          <button className="btn" onClick={load}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header + Period */}
      <div className="header">
        <div>
          <h1>Thống kê kinh doanh</h1>
          <p>Biểu đồ rõ ràng, số liệu trực quan</p>
        </div>
        <div className="periods">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`period ${period === p.value ? "active" : ""}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-title">Doanh thu hôm nay</div>
          <div className="kpi-value">{formatCurrency(kpis?.revenue?.today)}</div>
          <div className="kpi-sub">Tháng này: {formatCurrency(kpis?.revenue?.month)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Đơn hàng hôm nay</div>
          <div className="kpi-value">{formatNumber(kpis?.orders?.today)}</div>
          <div className="kpi-sub">Chờ xử lý: {formatNumber(kpis?.orders?.pending)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Người dùng</div>
          <div className="kpi-value">{formatNumber(kpis?.users?.total)}</div>
          <div className="kpi-sub">Mới hôm nay: {formatNumber(kpis?.users?.newToday)}</div>
        </div>
        <div className="kpi">
          <div className="kpi-title">Sản phẩm</div>
          <div className="kpi-value">{formatNumber(kpis?.products?.total)}</div>
          <div className="kpi-sub">Tồn kho thấp: {formatNumber(kpis?.products?.lowStock)}</div>
        </div>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="panel">
        <div className="panel-header">📈 Doanh thu & Số đơn theo thời gian</div>
        <div className="panel-body">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={revenueSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" tickFormatter={formatNumber} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
              <Tooltip formatter={(value, name) => (name === "Doanh thu" ? formatCurrency(value) : formatNumber(value))} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={3} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="orderCount" name="Số đơn" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status + Top products */}
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header">📦 Số lượng đơn theo trạng thái</div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={orderStatusBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} interval={0} angle={-10} height={50} />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Bar dataKey="count" name="Số đơn" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">🥧 Tỷ lệ sản phẩm bán chạy (theo doanh thu)</div>
          <div className="panel-body">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={topProductsPie} dataKey="value" nameKey="name" outerRadius={110} label>
                  {topProductsPie.map((entry, index) => (
                    <Cell key={`cell-p-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
