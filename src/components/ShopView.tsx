import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ShoppingCart, Plus, Minus, Trash2, Edit, X, Heart, ExternalLink, ShieldCheck, CheckCircle, Calculator, HeartPulse, LayoutGrid, Layers, QrCode } from 'lucide-react';
import { ShopProduct, UserProfile } from '../types';

interface ShopViewProps {
  user: UserProfile | null;
  products: ShopProduct[];
  cart: { product: ShopProduct; quantity: number }[];
  onUpdateCart: (cart: { product: ShopProduct; quantity: number }[]) => void;
  onAddProduct: (product: ShopProduct) => void;
  onDeleteProduct: (id: string) => void;
  onOpenAuth: () => void;
}

export default function ShopView({ user, products, cart, onUpdateCart, onAddProduct, onDeleteProduct, onOpenAuth }: ShopViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCart, setShowCart] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState<{ product: ShopProduct; quantity: number }[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productCategory, setProductCategory] = useState<'equipment' | 'book' | 'app' | 'other'>('equipment');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isExternal, setIsExternal] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const phoneInputId = useId();
  const addressInputId = useId();

  // Categories
  const categories = [
    { value: 'all', label: 'Tất cả sản phẩm' },
    { value: 'equipment', label: 'Thiết bị y tế' },
    { value: 'app', label: 'Ứng dụng & App học tập' },
    { value: 'book', label: 'Sách in vật lý' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleEdit = (product: ShopProduct) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setProductCategory(product.category);
    setImageUrl(product.imageUrl);
    setLinkUrl(product.linkUrl);
    setIsExternal(product.isExternal);
    setBankAccount(product.bankAccount || '');
    setQrCodeUrl(product.qrCodeUrl || '');
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setProductCategory('equipment');
    setImageUrl('');
    setLinkUrl('');
    setIsExternal(false);
    setBankAccount('');
    setQrCodeUrl('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) return;

    const newProduct: ShopProduct = {
      id: editingId || ('prod-' + Math.random().toString(36).substring(2, 9)),
      name,
      description,
      price: parseInt(price),
      category: productCategory,
      imageUrl,
      linkUrl,
      isExternal,
      bankAccount,
      qrCodeUrl
    };

    onAddProduct(newProduct);
    resetForm();
    setShowAddModal(false);
  };

  const addToCart = (product: ShopProduct) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      newCart = [...cart, { product, quantity: 1 }];
    }
    onUpdateCart(newCart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as { product: ShopProduct; quantity: number }[];
    onUpdateCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    onUpdateCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsOrdering(true);
    setTimeout(() => {
      setIsOrdering(false);
      setPurchasedItems(cart);
      setCheckoutSuccess(true);
      onUpdateCart([]); // Clear cart
    }, 2000);
  };

  const renderIcon = (imageUrl: string) => {
    switch(imageUrl) {
      case 'stethoscope':
        return <HeartPulse className="h-10 w-10 text-emerald-600 shrink-0" />;
      case 'calculator':
        return <Calculator className="h-10 w-10 text-emerald-600 shrink-0" />;
      case 'layout-grid':
        return <LayoutGrid className="h-10 w-10 text-emerald-600 shrink-0" />;
      default:
        return <ShoppingBag className="h-10 w-10 text-emerald-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Cart Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            Shop Y Khoa NPTMed
          </h2>
          <p className="text-sm text-slate-500">
            Nơi bày bán các sản phẩm y tế, web liên kết và các ứng dụng, phần mềm học tập có tính phí hữu ích.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 shadow-sm transition-all cursor-pointer text-sm shrink-0"
            >
              <Plus className="h-4.5 w-4.5" />
              Thêm Sản Phẩm
            </button>
          )}
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 shadow-sm transition-all cursor-pointer text-sm shrink-0"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            Giỏ Hàng
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xxs font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${selectedCategory === cat.value ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Listing Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="products-grid">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition-all relative overflow-hidden group"
            >
              <div className="space-y-4">
                {/* Product Cover Simulator */}
                <div className="aspect-video w-full rounded-xl bg-slate-50 border border-slate-100/50 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100/40 transition-colors">
                  {renderIcon(prod.imageUrl)}
                  
                  <span className="absolute top-2 left-2 bg-white/95 border border-slate-100 text-slate-600 text-xxs font-bold px-2 py-0.5 rounded-md shadow-xxs">
                    {categories.find(c => c.value === prod.category)?.label}
                  </span>

                  {user?.role === 'admin' && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 transition-opacity bg-white/80 p-1 rounded-lg backdrop-blur-sm border border-slate-100">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-1.5 bg-white border border-slate-200 rounded-md text-blue-600 shadow-sm hover:bg-blue-50"
                        title="Sửa sản phẩm"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Xóa sản phẩm này?')) onDeleteProduct(prod.id);
                        }}
                        className="p-1.5 bg-white border border-slate-200 rounded-md text-rose-600 shadow-sm hover:bg-rose-50"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-950 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xxs text-slate-400 font-medium uppercase">Giá bán</span>
                  <p className="text-base font-black text-slate-900">{formatPrice(prod.price)}</p>
                </div>

                {prod.isExternal ? (
                  <a
                    href={prod.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 px-4 text-xs font-bold text-slate-800 transition-all cursor-pointer"
                  >
                    Xem Liên Kết <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </a>
                ) : (
                  <button
                    onClick={() => addToCart(prod)}
                    className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white shadow-xxs transition-all cursor-pointer"
                  >
                    Thêm Vào Giỏ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl" id="shop-empty-state">
          <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">Sản phẩm đang được cập nhật</h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">Nguyễn Phi Trường liên tục liên kết và phân phối sản phẩm hữu ích.</p>
        </div>
      )}

      {/* Shopping Cart Drawer / Sidebar Panel */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="cart-backdrop"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full border-l border-slate-100"
                id="cart-sidebar-card"
              >
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <h3 className="font-extrabold text-slate-950 flex items-center gap-2 text-base">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    Giỏ Hàng Của Bạn
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="rounded-lg p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer text-sm font-bold"
                  >
                    X
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {checkoutSuccess ? (
                    <div className="text-center py-8 space-y-6">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-lg">Đặt Hàng Thành Công!</h4>
                        <p className="text-xs text-slate-500 px-4 leading-relaxed">
                          Yêu cầu đặt mua của bạn đã được ghi nhận. Vui lòng thanh toán theo thông tin bên dưới. Quản trị viên Nguyễn Phi Trường sẽ liên hệ để bàn giao trong vòng vài giờ.
                        </p>
                      </div>

                      {/* Payment Information Block */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-4">
                        <h5 className="font-bold text-sm text-slate-900">Thông tin thanh toán</h5>
                        <div className="space-y-3">
                          {purchasedItems.map((item, idx) => {
                            const hasCustomPayment = item.product.bankAccount || item.product.qrCodeUrl;
                            return (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-xs">
                                <p className="font-semibold text-slate-900 mb-1">{item.product.name} (x{item.quantity})</p>
                                <p className="text-emerald-600 font-bold mb-2">{formatPrice(item.product.price * item.quantity)}</p>
                                
                                {hasCustomPayment ? (
                                  <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <p className="text-slate-500 font-medium">Thanh toán riêng cho sản phẩm này:</p>
                                    {item.product.bankAccount && (
                                      <p className="font-bold text-slate-800 bg-slate-50 p-2 rounded">{item.product.bankAccount}</p>
                                    )}
                                    {item.product.qrCodeUrl && (
                                      <img src={item.product.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain rounded-md border border-slate-200 mx-auto" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <p className="text-slate-500 font-medium">Thanh toán mặc định (Shop NPTMed):</p>
                                    <div className="bg-slate-50 p-3 rounded text-center border border-slate-100 flex flex-col items-center gap-2">
                                      <QrCode className="h-8 w-8 text-emerald-600" />
                                      <p className="text-xs text-slate-500">Quét mã QR từ ảnh bạn nhận được hoặc chuyển khoản</p>
                                      <p className="font-bold text-slate-800 text-sm">1224682222<br/>MB Bank<br/>NGUYEN PHI TRUONG</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCheckoutSuccess(false);
                          setShowCart(false);
                          setPurchasedItems([]);
                        }}
                        className="rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-5 transition-all cursor-pointer"
                      >
                        Đóng & Tiếp Tục Mua Sắm
                      </button>
                    </div>
                  ) : cart.length > 0 ? (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex gap-4 border-b border-slate-100 pb-4 items-start"
                        >
                          <div className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-100/50 flex items-center justify-center shrink-0">
                            {renderIcon(item.product.imageUrl)}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-slate-950 text-sm line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-emerald-600 font-extrabold">{formatPrice(item.product.price)}</p>
                            
                            <div className="flex items-center justify-between pt-1.5">
                              <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-100 p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.product.id, -1)}
                                  className="p-1 hover:bg-white rounded-md text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                  aria-label="Giảm số lượng"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-bold px-2 text-slate-800">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, 1)}
                                  className="p-1 hover:bg-white rounded-md text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                                  aria-label="Tăng số lượng"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                                aria-label="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Checkout form info */}
                      <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Thông tin liên hệ</h4>
                        
                        <div>
                          <label htmlFor={phoneInputId} className="block text-xxs text-slate-500 font-medium mb-1">Số điện thoại *</label>
                          <input
                            id={phoneInputId}
                            type="tel"
                            required
                            placeholder="0912 345 678"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label htmlFor={addressInputId} className="block text-xxs text-slate-500 font-medium mb-1">Địa chỉ nhận hàng (nếu là thiết bị)</label>
                          <input
                            id={addressInputId}
                            type="text"
                            placeholder="Địa chỉ hoặc Email nhận tài khoản App"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>

                        {/* Order Calculation details */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs mt-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Tổng sản phẩm:</span>
                            <span className="text-slate-900 font-medium">{totalItems}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-200/50">
                            <span className="text-slate-400 font-medium">Thành tiền:</span>
                            <strong className="text-slate-950 font-black text-sm">{formatPrice(cartTotal)}</strong>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isOrdering}
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 py-3 text-sm font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {isOrdering ? (
                            <>
                              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block mr-1" />
                              Đang xử lý đơn hàng...
                            </>
                          ) : (
                            'Xác Nhận Đặt Hàng'
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <ShoppingCart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-900">Giỏ hàng của bạn đang trống</h4>
                      <p className="text-xs text-slate-500 mt-1">Hãy thêm những app học tập hoặc sản phẩm hữu ích để thực hành.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              id="add-product-backdrop"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 z-10"
              id="add-product-form-card"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                  {editingId ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <form id="add-product-form" onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên sản phẩm *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Ống nghe Littmann..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mô tả chi tiết</label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả về sản phẩm..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none custom-scrollbar"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá bán (VNĐ) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="VD: 500000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Danh mục *</label>
                      <select
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      >
                        <option value="equipment">Thiết bị y tế</option>
                        <option value="book">Sách in vật lý</option>
                        <option value="app">Ứng dụng & App học tập</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Icon/Hình ảnh (tên từ lucide-react) *</label>
                    <select
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    >
                      <option value="">-- Chọn icon đại diện --</option>
                      <option value="calculator">Máy tính / Công cụ (Calculator)</option>
                      <option value="heartPulse">Tim mạch / Huyết áp (HeartPulse)</option>
                      <option value="heart">Tim / Y tế cơ bản (Heart)</option>
                      <option value="layoutGrid">Ứng dụng / App (LayoutGrid)</option>
                      <option value="layers">Nhiều lớp / Sách (Layers)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" 
                        id="isExternalShop" 
                        checked={isExternal} 
                        onChange={(e) => setIsExternal(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <label htmlFor="isExternalShop" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Sản phẩm liên kết web ngoài
                      </label>
                    </div>
                    
                    {isExternal && (
                      <div className="mt-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Đường dẫn liên kết (URL)</label>
                        <input
                          type="url"
                          required={isExternal}
                          placeholder="https://..."
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số tài khoản riêng lẻ (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="VD: 123456789 ACB Nguyễn Văn A"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Để trống nếu muốn sử dụng tài khoản/QR mặc định của Shop.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mã QR riêng lẻ URL (Tùy chọn)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={qrCodeUrl}
                      onChange={(e) => setQrCodeUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </form>
              </div>
              
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  form="add-product-form"
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 px-6 text-sm font-bold text-white shadow-sm transition-all cursor-pointer"
                >
                  {editingId ? 'Lưu Thay Đổi' : 'Đăng Sản Phẩm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
