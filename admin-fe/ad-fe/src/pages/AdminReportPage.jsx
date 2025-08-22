import React, { useEffect, useState } from "react";
import axios from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";
import "./AdminReportPage.css";

const periodOptions = [
  { label: "7 ngày", value: "7d" },
  { label: "30 ngày", value: "30d" },
  { label: "12 tháng", value: "12m" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminReportPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    
    try {
      let params = {};
      if (dateFrom && dateTo) {
        params = { startDate: dateFrom, endDate: dateTo };
      } else {
        params = { period };
      }

      const [rev, top, orders, users, products] = await Promise.all([
        axios.get("/admin/dashboard/revenue-chart", { params }),
        axios.get("/admin/dashboard/top-products?limit=10"),
        axios.get("/admin/dashboard/order-stats"),
        axios.get("/admin/dashboard/user-stats"),
        axios.get("/admin/dashboard/product-stats")
      ]);

      if (rev.data.success) {
        console.log('Revenue chart data:', rev.data.data?.chart);
        setRevenueData(rev.data.data?.chart || []);
      }
      if (top.data.success) {
        setTopProducts(top.data.data || []);
      }
      if (orders.data.success) {
        setOrderStats(orders.data.data || []);
      }
      if (users.data.success) {
        setUserStats(users.data.data);
      }
      if (products.data.success) {
        setProductStats(products.data.data);
      }
    } catch (err) {
      console.error("Report error:", err);
      setError(err.response?.data?.message || "Lỗi tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period, dateFrom, dateTo]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value || 0);
  };

  const formatNumber = (num) => {
    return num?.toLocaleString("vi-VN") || 0;
  };

  const getOrderStatusLabel = (status) => {
    const statusMap = {
      'confirmed': 'Đã xác nhận',
      'cho_xu_ly': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'delivered': 'Đã giao',
      'failed_delivery': 'Giao hàng thất bại',
      'cancelled_by_customer': 'Khách hủy',
      'null': 'Không xác định'
    };
    return statusMap[status] || status;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Thời gian: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.name === 'Doanh thu' ? formatCurrency(entry.value) : formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="report-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-page">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page">
      {/* Header */}
      <div className="report-header">
        <div className="header-content">
          <h1> Báo cáo & Thống kê</h1>
          <p>Phân tích dữ liệu kinh doanh và hiệu suất hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Lọc theo thời gian:</label>
          <div className="period-buttons">
            {periodOptions.map(opt => (
              <button 
                key={opt.value} 
                onClick={() => {
                  setPeriod(opt.value);
                  setDateFrom("");
                  setDateTo("");
                }}
                className={`period-btn ${period === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-group">
          <label>Hoặc chọn khoảng thời gian:</label>
          <div className="date-inputs">
            <input 
              type="date" 
              value={dateFrom} 
              onChange={e => {
                setDateFrom(e.target.value);
                setPeriod("");
              }}
              className="date-input"
            />
            <span>đến</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={e => {
                setDateTo(e.target.value);
                setPeriod("");
              }}
              className="date-input"
            />
            <button onClick={loadData} className="filter-btn">
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>📊 Biểu đồ doanh thu</h2>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                stroke="#666"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#666"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#2563eb" 
                strokeWidth={3}
                name="Doanh thu"
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="orderCount" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Số đơn hàng"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Top Products */}
        <div className="stats-card">
          <div className="card-header">
            <h3>🏆 Top 10 sản phẩm bán chạy</h3>
          </div>
          <div className="card-content">
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sản phẩm</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td className="rank">{index + 1}</td>
                      <td className="product-name">{product.name}</td>
                      <td className="quantity">{formatNumber(product.totalSold)}</td>
                      <td className="revenue">{formatCurrency(product.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="stats-card">
          <div className="card-header">
            <h3>📦 Trạng thái đơn hàng</h3>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderStats} layout="horizontal" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="status" type="category" stroke="#666" width={80} />
                <Tooltip 
                  formatter={(value, name) => [formatNumber(value), 'Số đơn']}
                  labelFormatter={(label) => `Trạng thái: ${getOrderStatusLabel(label)}`}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        {userStats && (
          <div className="stats-card">
            <div className="card-header">
              <h3>👥 Thống kê người dùng</h3>
            </div>
            <div className="card-content">
              <div className="stats-grid-small">
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(userStats.total)}</div>
                  <div className="stat-label">Tổng người dùng</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(userStats.customers)}</div>
                  <div className="stat-label">Khách hàng</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(userStats.staff)}</div>
                  <div className="stat-label">Nhân viên</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(userStats.newToday)}</div>
                  <div className="stat-label">Mới hôm nay</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(userStats.newThisMonth)}</div>
                  <div className="stat-label">Mới tháng này</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {productStats && (
          <div className="stats-card">
            <div className="card-header">
              <h3>📦 Thống kê sản phẩm</h3>
            </div>
            <div className="card-content">
              <div className="stats-grid-small">
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(productStats.total)}</div>
                  <div className="stat-label">Tổng sản phẩm</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(productStats.active)}</div>
                  <div className="stat-label">Sản phẩm hoạt động</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(productStats.hidden)}</div>
                  <div className="stat-label">Sản phẩm ẩn</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(productStats.lowStock)}</div>
                  <div className="stat-label">Sản phẩm tồn kho thấp</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(productStats.outOfStock)}</div>
                  <div className="stat-label">Sản phẩm hết hàng</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{formatNumber(productStats.discounted)}</div>
                  <div className="stat-label">Sản phẩm khuyến mãi</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 