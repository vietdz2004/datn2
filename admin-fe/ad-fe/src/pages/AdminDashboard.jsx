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

const STATUS_LABELS = {
  cho_xu_ly: "Chờ xử lý",
  da_xac_nhan: "Đã xác nhận",
  dang_giao: "Đang giao",
  da_giao: "Hoàn tất",
  cancelled_by_admin: "Hủy",
  cancelled_by_customer: "Hủy",
  huy_boi_admin: "Hủy",
  huy_boi_khach: "Hủy",
};

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#94a3b8"];

const formatNumber = (n) => (n ?? 0).toLocaleString("vi-VN");
const formatCurrency = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // KPIs
  const [overview, setOverview] = useState(null);

  // Charts
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Mini tables
  const [latestOrders, setLatestOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [ov, rev, ost, top, low, latest] = await Promise.all([
        axios.get("/admin/dashboard/overview"),
        axios.get("/admin/dashboard/revenue-chart", { params: { period: "12m" } }),
        axios.get("/admin/dashboard/order-stats"),
        axios.get("/admin/dashboard/top-products", { params: { limit: 5 } }),
        axios.get("/admin/dashboard/low-stock"),
        axios.get("/admin/orders", { params: { limit: 5, sortBy: "createdAt", sortOrder: "DESC" } }),
      ]);

      if (ov.data?.success) setOverview(ov.data.data);
      if (rev.data?.success) setRevenueSeries(rev.data.data?.chart || []);
      if (ost.data?.success) setOrderStats(ost.data.data || []);
      if (top.data?.success) setTopProducts(top.data.data || []);
      if (low.data?.success) setLowStock(low.data.data || []);
      if (latest.data?.success) setLatestOrders(latest.data.data || latest.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Lỗi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build current-year monthly array (Tháng 1..12)
  const monthlyData = useMemo(() => {
    const thisYear = new Date().getFullYear().toString();
    const base = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i + 1,
      month: `Tháng ${i + 1}`,
      revenue: 0,
      orderCount: 0,
    }));

    for (const item of revenueSeries || []) {
      const p = String(item.period || "");
      let y = "", m = 0;
      // Accept YYYY-MM or YYYY-MM-DD
      if (/^\d{4}-\d{2}$/.test(p)) {
        y = p.slice(0, 4);
        m = parseInt(p.slice(5, 7));
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(p)) {
        y = p.slice(0, 4);
        m = parseInt(p.slice(5, 7));
      } else {
        continue;
      }
      if (y === thisYear && m >= 1 && m <= 12) {
        base[m - 1].revenue += Number(item.revenue || 0);
        base[m - 1].orderCount += Number(item.orderCount || item.completedOrders || 0);
      }
    }
    return base.map(({ month, revenue, orderCount }) => ({ month, revenue, orderCount }));
  }, [revenueSeries]);

  const cancelPie = useMemo(() => {
    const total = (orderStats || []).reduce((acc, s) => acc + (s.count || 0), 0) || 1;
    const cancelled = (orderStats || []).filter(s => ["cancelled_by_admin", "cancelled_by_customer", "huy_boi_admin", "huy_boi_khach"].includes(s.status)).reduce((a, b) => a + (b.count || 0), 0);
    return [
      { name: "Hủy", value: cancelled, color: "#ef4444" },
      { name: "Khác", value: total - cancelled, color: "#10b981" },
    ];
  }, [orderStats]);

  const orderBarData = useMemo(() => {
    const grouped = {};
    for (const s of orderStats) {
      const key = STATUS_LABELS[s.status] || s.status;
      if (!key) continue;
      grouped[key] = (grouped[key] || 0) + (s.count || 0);
    }
    const desired = ["Chờ xử lý", "Đã xác nhận", "Đang giao", "Hoàn tất", "Hủy"];
    return desired.map(k => ({ status: k, count: grouped[k] || 0 }));
  }, [orderStats]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-48 flex items-center justify-center text-gray-600">Đang tải dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="text-red-500 mb-3">{error}</div>
          <button onClick={load} className="px-3 py-2 bg-primary text-white rounded-lg">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-3">
          <div className="text-primary text-2xl">🛒</div>
          <div>
            <div className="text-sm text-gray-500">Đơn hàng hôm nay</div>
            <div className="text-2xl font-semibold">{formatNumber(overview?.orders?.today)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-3">
          <div className="text-green-600 text-2xl">💰</div>
          <div>
            <div className="text-sm text-gray-500">Doanh thu hôm nay</div>
            <div className="text-2xl font-semibold">{formatCurrency(overview?.revenue?.today)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-3">
          <div className="text-amber-500 text-2xl">📦</div>
          <div>
            <div className="text-sm text-gray-500">Sản phẩm sắp hết hàng</div>
            <div className="text-2xl font-semibold">{formatNumber(overview?.products?.lowStock || lowStock?.length)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center gap-3">
          <div className="text-purple-600 text-2xl">👥</div>
          <div>
            <div className="text-sm text-gray-500">Khách hàng mới</div>
            <div className="text-2xl font-semibold">{formatNumber(overview?.users?.newToday)}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">📈 Doanh thu theo tháng (đường)</div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip formatter={(v, n) => (n === "revenue" ? formatCurrency(v) : formatNumber(v))} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">📦 Số lượng đơn theo trạng thái</div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} interval={0} angle={-10} height={50} />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip formatter={(v) => formatNumber(v)} />
                <Bar dataKey="count" name="Số đơn" fill="#2563eb" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly revenue bar chart */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">📊 Doanh thu theo tháng (cột)</div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">🏆 Top 5 sản phẩm bán chạy</div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatNumber} />
                <YAxis type="category" dataKey="name" width={140} />
                <Tooltip formatter={(v, n) => (n === "totalSold" ? formatNumber(v) : formatCurrency(v))} />
                <Legend />
                <Bar dataKey="totalSold" name="Số lượng" fill="#10b981" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">🥧 Tỷ lệ hủy đơn hàng</div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" nameKey="name" data={cancelPie} outerRadius={110} label>
                  {cancelPie.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => formatNumber(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mini tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">� Đơn hàng mới nhất</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Mã</th>
                  <th className="py-2 pr-4">Khách hàng</th>
                  <th className="py-2 pr-4">Tổng</th>
                  <th className="py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(latestOrders || []).slice(0,5).map((o) => (
                  <tr key={o.id_DonHang} className="border-t">
                    <td className="py-2 pr-4">{o.maDonHang || `DH${o.id_DonHang}`}</td>
                    <td className="py-2 pr-4">{o.customerName || o.tenNguoiNhan || '-'}</td>
                    <td className="py-2 pr-4">{formatCurrency(o.tongThanhToan)}</td>
                    <td className="py-2">{STATUS_LABELS[o.trangThaiDonHang] || o.trangThaiDonHang}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="font-semibold mb-2">⚠️ Sản phẩm tồn kho thấp</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Sản phẩm</th>
                  <th className="py-2 pr-4">Còn</th>
                  <th className="py-2">Tối thiểu</th>
                </tr>
              </thead>
              <tbody>
                {(lowStock || []).slice(0,5).map((p, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4">{formatNumber(p.currentStock)}</td>
                    <td className="py-2">{formatNumber(p.minStock)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}