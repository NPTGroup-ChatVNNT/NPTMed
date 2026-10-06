import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Users, Eye, Calendar, UserCheck, TrendingUp, RefreshCw, Crown, CheckCircle2, XCircle, Image as ImageIcon, ExternalLink, Key } from 'lucide-react';

export default function AdminDashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [issuingKeyOrderId, setIssuingKeyOrderId] = useState<string | null>(null);

  const loadStats = () => {
    setIsLoading(true);
    fetch('/api/analytics/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleUpdateOrderStatus = (orderId: string, status: 'approved' | 'rejected') => {
    let generatedKey = '';
    if (status === 'approved') {
      generatedKey = `NPTMED-PRO-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }

    setIssuingKeyOrderId(orderId);
    fetch(`/api/key-orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, issuedKey: generatedKey }),
    })
      .then(res => res.json())
      .then(() => {
        setIssuingKeyOrderId(null);
        loadStats();
      })
      .catch(err => {
        setIssuingKeyOrderId(null);
        console.error(err);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600" />
            Thống Kê Hệ Thống & Quản Lý Khách Hàng Mua Key
          </h2>
          <p className="text-slate-500 mt-1">
            Bảng điều khiển 30 ngày dành riêng cho Nhà Phát Hành NPTMed.
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {!stats ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Đơn Mua Key Chờ Duyệt</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Crown className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-amber-600">{stats.pendingOrdersCount || 0}</p>
              <p className="text-[11px] text-amber-700 mt-1 font-medium">Khách gửi minh chứng 20k</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Lượt Truy Cập Hôm Nay</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Eye className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.todayVisits || 0}</p>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Cập nhật trực tiếp
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Lượt Truy Cập (30 Ngày)</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.monthlyVisits || 0}</p>
              <p className="text-[11px] text-blue-600 mt-1 font-medium">Lưu lượng trong 1 tháng</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase text-slate-400">Đăng Nhập Trong Tháng</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserCheck className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stats.activeUsersMonth || 0}</p>
              <p className="text-[11px] text-indigo-600 mt-1 font-medium">Tài khoản hoạt động 30 ngày</p>
            </motion.div>
          </div>

          {/* Section: Khách Hàng Mua Key (Duyệt Đơn & Minh Chứng) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  Khách Hàng Mua Key Pro (Phí 20.000đ/tháng)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Danh sách khách hàng đã thanh toán và gửi ảnh minh chứng chuyển khoản
                </p>
              </div>
              {stats.pendingOrdersCount > 0 && (
                <span className="px-3 py-1 bg-amber-500 text-white rounded-full font-bold text-xs animate-pulse">
                  {stats.pendingOrdersCount} đơn mới chờ duyệt
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              {stats.keyOrders && stats.keyOrders.length > 0 ? (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-6">Khách Hàng (Email)</th>
                      <th className="p-3.5">Thời Gian</th>
                      <th className="p-3.5">Số Tiền</th>
                      <th className="p-3.5">Minh Chứng</th>
                      <th className="p-3.5">Trạng Thái & Key Cấp</th>
                      <th className="p-3.5 pr-6 text-right">Thao Tác Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.keyOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3.5 pl-6 font-bold text-slate-900">
                          {order.email}
                          <span className="block text-[10px] font-normal text-slate-400">{order.note}</span>
                        </td>
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">{order.createdAtStr}</td>
                        <td className="p-3.5 font-extrabold text-amber-600 whitespace-nowrap">
                          {order.amount?.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="p-3.5">
                          {order.proofImage ? (
                            <button
                              onClick={() => setSelectedProof(order.proofImage)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-[11px]"
                            >
                              <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
                              Xem ảnh chuyển khoản
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">Không có ảnh</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {order.status === 'pending' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              Chờ xác nhận 20k
                            </span>
                          )}
                          {order.status === 'approved' && (
                            <div className="space-y-0.5">
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                                ✅ Đã Duyệt & Kích Hoạt
                              </span>
                              {order.issuedKey && (
                                <p className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  {order.issuedKey}
                                </p>
                              )}
                            </div>
                          )}
                          {order.status === 'rejected' && (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px]">
                              ❌ Đã từ chối
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 pr-6 text-right whitespace-nowrap">
                          {order.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                                disabled={issuingKeyOrderId === order.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Kích Hoạt Key Pro
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                                disabled={issuingKeyOrderId === order.id}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-lg font-medium text-xs transition-colors"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Đã hoàn tất</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có lượt đăng ký mua Key Pro nào.
                </div>
              )}
            </div>
          </motion.div>

          {/* Modal Preview Proof Image */}
          {selectedProof && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
              <div className="relative bg-white rounded-2xl p-4 max-w-xl w-full max-h-[90vh] overflow-auto shadow-2xl">
                <button
                  onClick={() => setSelectedProof(null)}
                  className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700"
                >
                  ✕
                </button>
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Ảnh Minh Chứng Chuyển Khoản</h4>
                <img src={selectedProof} alt="Minh chứng" className="w-full h-auto rounded-xl border border-slate-200" />
              </div>
            </div>
          )}

          {/* 30-Day Activity Chart/Visual Bar */}
          {stats.dailyChartData && stats.dailyChartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Biểu Đồ Lưu Lượng Truy Cập 30 Ngày Gần Nhất
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Tổng 30 ngày: <strong>{stats.monthlyVisits}</strong> lượt
                </span>
              </div>

              <div className="h-32 flex items-end gap-1.5 pt-4 pb-2 border-b border-slate-100 overflow-x-auto">
                {stats.dailyChartData.map((d: any, idx: number) => {
                  const maxVal = Math.max(...stats.dailyChartData.map((item: any) => item.visits), 1);
                  const heightPercent = Math.max(8, Math.round((d.visits / maxVal) * 100));
                  return (
                    <div key={idx} className="flex-1 min-w-[18px] flex flex-col items-center group relative">
                      <div className="absolute -top-10 hidden group-hover:flex flex-col items-center z-10 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                        <span>Ngày {d.date}: {d.visits} lượt</span>
                        <span>{d.users} người dùng</span>
                      </div>
                      <div 
                        style={{ height: `${heightPercent}%` }} 
                        className={`w-full rounded-t-md transition-all ${
                          d.visits > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-100'
                        }`}
                      />
                      <span className="text-[9px] text-slate-400 mt-1 truncate w-full text-center">
                        {idx % 5 === 0 ? d.date : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* User Activity Log Table (1 Month) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Dữ Liệu Người Dùng Đăng Nhập Trong 1 Tháng ({stats.monthlyUsersList?.length || 0})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Thống kê chi tiết tài khoản đã truy cập hệ thống NPTMed</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {stats.monthlyUsersList && stats.monthlyUsersList.length > 0 ? (
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 pl-6">Tài khoản Email</th>
                      <th className="p-3.5">Lần hoạt động gần nhất</th>
                      <th className="p-3.5">Tổng lượt truy cập</th>
                      <th className="p-3.5 pr-6 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.monthlyUsersList.map((user: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-6 font-medium text-slate-900 flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user.email.substring(0, 1)}
                          </div>
                          <span>{user.email}</span>
                          {user.email === 'nguyenphitruong1973@gmail.com' && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold">
                              Nhà Phát Hành
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500">{user.lastActive}</td>
                        <td className="p-3.5 font-bold text-slate-700">{user.visitCount} lượt</td>
                        <td className="p-3.5 pr-6 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Đã xác minh
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có dữ liệu đăng nhập trong 30 ngày qua.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


