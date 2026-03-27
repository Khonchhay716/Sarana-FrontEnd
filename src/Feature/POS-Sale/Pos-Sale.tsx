import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useGlobleContextDarklight } from "../../AllContext/context";

// ─── Axios Setup ──────────────────────────────────────────────────────────────
const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:9999/api/";

const AxiosApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10 * 60 * 1000,
  headers: { "Content-Type": "application/json" },
});

const getAccessToken = (): string | null => {
  try {
    const lib = localStorage.getItem("CurrentUserLibrary");
    if (lib) return JSON.parse(lib).accessToken ?? null;
  } catch { }
  return localStorage.getItem("token");
};

let isRefreshing = false;
let failedQueue: ((token: string) => void)[] = [];
const processQueue = (token: string) => {
  failedQueue.forEach(cb => cb(token));
  failedQueue = [];
};

const refreshTokens = async (): Promise<string | null> => {
  const lib = localStorage.getItem("CurrentUserLibrary");
  if (!lib) return null;
  let refreshToken: string;
  try {
    refreshToken = JSON.parse(lib).refreshToken;
    if (!refreshToken) return null;
  } catch { return null; }
  if (isRefreshing) return new Promise(resolve => { failedQueue.push(resolve); });
  try {
    isRefreshing = true;
    const res = await axios.post(`${BASE_URL}auth/refresh-token`, {
      refreshToken, ipAddress: "string", deviceInfo: "string",
    });
    if (res.data.success && res.data.data) {
      localStorage.setItem("CurrentUserLibrary", JSON.stringify(res.data.data));
      processQueue(res.data.data.accessToken);
      return res.data.data.accessToken;
    }
    return null;
  } catch { return null; } finally { isRefreshing = false; }
};

AxiosApi.interceptors.request.use((config: any) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

AxiosApi.interceptors.response.use(
  res => res,
  async (error) => {
    const orig: any = error.config;
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const newToken = await refreshTokens();
      if (newToken) {
        orig.headers["Authorization"] = `Bearer ${newToken}`;
        return AxiosApi(orig);
      }
      localStorage.removeItem("CurrentUserLibrary");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface TypeNamebase { id: number; name: string; }
interface Category {
  id: number; name: string; description?: string; image?: string; isActive?: boolean;
}
interface Product {
  id: number; name: string; description?: string; sku?: string; barcode?: string;
  price: number; costPrice?: number; stock?: number; imageProduct?: string;
  ram?: string; storage?: string; categoryId?: number; branchId?: number;
  isSerialNumber?: boolean; minStock?: number;
  category?: TypeNamebase; branch?: TypeNamebase;
}
interface CartItem extends Product { qty: number; }
interface PaginatedResponse<T> {
  data: T[]; totalCount: number; page: number; pageSize: number;
  totalPages: number; hasPrevious: boolean; hasNext: boolean;
}
interface PlaceOrderPayload {
  items: {
    productId: number; name: string; sku?: string; barcode?: string;
    qty: number; unitPrice: number; total: number;
    categoryId?: number; categoryName?: string;
    branchId?: number; branchName?: string;
  }[];
  subtotal: number; totalQty: number; placedAt: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────
const fetchCategories = async (
  params: { page?: number; pageSize?: number; search?: string }
): Promise<PaginatedResponse<Category>> => {
  const p: any = { Page: params.page ?? 1, PageSize: params.pageSize ?? 100 };
  if (params.search) p.Search = params.search;
  const res = await AxiosApi.get("Category", { params: p });
  return res.data;
};

const fetchProducts = async (
  params: { page?: number; pageSize?: number; search?: string; categoryId?: string }
): Promise<PaginatedResponse<Product>> => {
  const p: any = { Page: params.page ?? 1, PageSize: params.pageSize ?? 20 };
  if (params.search) p.Search = params.search;
  if (params.categoryId && params.categoryId !== "0") p.CategoryId = params.categoryId;
  const res = await AxiosApi.get("Product/Sale-POS", { params: p });
  return res.data;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const PLACEHOLDER_LIGHT = "https://placehold.co/300x300/e2e8f0/94a3b8?text=No+Image";
const PLACEHOLDER_DARK = "https://placehold.co/300x300/1e293b/475569?text=No+Image";
const PAGE_SIZE = 20;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PosShop() {
  const { darkLight } = useGlobleContextDarklight();
  const dark = darkLight;

  // ── Categories ────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>("0");

  useEffect(() => {
    fetchCategories({})
      .then(res => setCategories(res?.data ?? []))
      .catch(console.error);
  }, []);

  // ── Products ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset on filter change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab, debouncedSearch]);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (page === 1) setLoadingProducts(true);
      else setLoadingMore(true);
      try {
        const res = await fetchProducts({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch,
          categoryId: activeTab,
        });
        if (!cancelled) {
          const data = res?.data ?? [];
          setProducts(prev => page === 1 ? data : [...prev, ...data]);
          // Use API's hasNext when available, else fall back to page-size heuristic
          setHasMore(res.hasNext ?? data.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
          setLoadingMore(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [page, activeTab, debouncedSearch]);

  // Infinite-scroll trigger
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 150 &&
      hasMore && !loadingMore && !loadingProducts
    ) {
      setPage(p => p + 1);
    }
  }, [hasMore, loadingMore, loadingProducts]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  const handlePlaceOrder = () => {
    const payload: PlaceOrderPayload = {
      items: cart.map(i => ({
        productId: i.id, name: i.name, sku: i.sku, barcode: i.barcode,
        qty: i.qty, unitPrice: i.price, total: i.price * i.qty,
        categoryId: i.category?.id, categoryName: i.category?.name,
        branchId: i.branch?.id, branchName: i.branch?.name,
      })),
      subtotal,
      totalQty,
      placedAt: new Date().toISOString(),
    };
    console.log("🛒 Place Order Payload =>", payload);
  };

  const allTabs = [
    { id: "0", name: "All", image: null as string | null },
    ...categories.map(c => ({ id: String(c.id), name: c.name, image: c.image ?? null })),
  ];

  // ─── Theme ────────────────────────────────────────────────────────────────
  const bg = dark ? "bg-[#0f172a]" : "bg-[#f1f5f9]";
  const sidebarBg = dark ? "bg-[#1e293b]" : "bg-white";
  const panelBg = dark ? "bg-[#1e293b]" : "bg-white";
  const productBg = dark ? "bg-[#1e293b]" : "bg-white";
  const borderColor = dark ? "border-slate-700/60" : "border-slate-200";
  const textPrimary = dark ? "text-slate-100" : "text-slate-900";
  const textSub = dark ? "text-slate-400" : "text-slate-500";
  const textMuted = dark ? "text-slate-500" : "text-slate-400";
  const inputBg = dark ? "bg-slate-800/80" : "bg-slate-100";
  const rowBg = dark ? "bg-slate-800" : "bg-slate-50 border border-slate-200";
  const scrollStyle = dark ? "#334155 transparent" : "#cbd5e0 transparent";
  const imgFallback = dark ? PLACEHOLDER_DARK : PLACEHOLDER_LIGHT;

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`flex ${bg} ${textPrimary} overflow-hidden transition-colors duration-300 `} style={{ height: "calc(100vh - 80px)" }}>
      {/* list cetegory  */}
      <div className={`w-[104px] shrink-0 flex flex-col overflow-hidden ${sidebarBg} border-r ${borderColor} transition-colors duration-300`}>
        <div
          className="flex-1 overflow-y-auto py-2 px-2 flex flex-col gap-1.5"
          style={{ scrollbarWidth: "none" }}
        >
          {allTabs.map(cat => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-200
                  ${isActive
                    ? dark ? "bg-blue-600/20 ring-2 ring-blue-500/50" : "bg-blue-50 ring-2 ring-blue-400/50"
                    : dark ? "hover:bg-slate-700/60" : "hover:bg-slate-100"
                  }`}
              >
                <div className={`w-[68px] h-[68px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-all duration-200
                  ${isActive
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"
                    : dark ? "bg-slate-700/80 ring-1 ring-slate-600/50" : "bg-slate-100 ring-1 ring-slate-200"
                  }`}
                >
                  {cat.id === "0" ? (
                    <svg className={`w-8 h-8 ${isActive ? "text-blue-400" : textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  ) : cat.image ? (
                    <img
                      src={cat.image} alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
                    />
                  ) : (
                    <svg className={`w-7 h-7 ${isActive ? "text-blue-400" : textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <span className={`text-[11px] font-semibold text-center leading-tight w-full truncate
                  ${isActive ? (dark ? "text-blue-400" : "text-blue-600") : textSub}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/*list product  */}
      <div className={`flex flex-col flex-1 overflow-hidden border-r ${borderColor} transition-colors duration-300`}>
        <div className={`flex items-center gap-3 px-4 py-2 ${panelBg} border-b ${borderColor}`}>
          <span className={`text-2xl font-black tracking-wider drop-shadow-sm ${darkLight ? "text-white" : "text-blue-900"
            }`}>
            WELCOME SOKHA <span className="text-yellow-500">SK</span>
          </span>

          <div className={`ml-auto flex items-center gap-2 w-[250px] px-3 py-2 rounded-xl ${inputBg}`}>
            <svg
              className={`w-4 h-4 ${textMuted} shrink-0`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>

            <input
              className={`flex-1 bg-transparent text-sm ${textPrimary} placeholder-slate-400 outline-none`}
              placeholder="Search Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className={`${textMuted} hover:text-red-400 transition-colors text-sm`}
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5"
          style={{ scrollbarWidth: "thin", scrollbarColor: scrollStyle }}
          onScroll={handleScroll}
        >
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Spinner size="lg" />
              <p className={`${textMuted} text-sm`}>Loading products…</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="text-5xl">📦</span>
              <p className={`${textMuted} text-sm font-medium`}>No products found</p>
            </div>
          ) : (
            <>
              {products.map(p => (
                <ProductRow
                  key={p.id}
                  product={p}
                  cartItem={cart.find(i => i.id === p.id)}
                  onAdd={addToCart}
                  dark={dark}
                  productBg={productBg}
                  borderColor={borderColor}
                  textPrimary={textPrimary}
                  textSub={textSub}
                  textMuted={textMuted}
                  imgFallback={imgFallback}
                />
              ))}
              {loadingMore && (
                <div className={`flex items-center justify-center gap-3 py-5 mx-2 rounded-2xl
                  ${dark ? "bg-slate-800/60" : "bg-slate-100/80"}`}
                >
                  <Spinner size="sm" />
                  <span className={`${textMuted} text-sm font-medium`}>
                    Loading more products…
                  </span>
                </div>
              )}
              {!hasMore && !loadingMore && products.length > 0 && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className={`h-px flex-1 ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
                  <span className={`${textMuted} text-xs font-medium px-2`}>No more products</span>
                  <div className={`h-px flex-1 ${dark ? "bg-slate-700" : "bg-slate-200"}`} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* // list product order  */}
      <div className={`w-80 xl:w-96 flex flex-col overflow-hidden ${panelBg} shrink-0 transition-colors duration-300`}>

        <div className={`flex items-center gap-2.5 px-4 py-3.5 border-b ${borderColor} shrink-0`}>
          <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className={`font-bold text-base flex-1 ${textPrimary}`}>Order Details</h2>
          {totalQty > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {totalQty}
            </span>
          )}
          {cart.length > 0 && (
            <button onClick={clearCart} title="Clear cart"
              className={`${textMuted} hover:text-red-400 transition-colors ml-1`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
        <div
          className="flex-1 overflow-y-auto px-3 py-3 space-y-2"
          style={{ scrollbarWidth: "thin", scrollbarColor: scrollStyle }}
        >
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 pb-10">
              <div className={`w-16 h-16 rounded-full ${dark ? "bg-slate-800" : "bg-slate-100"} flex items-center justify-center`}>
                <svg className={`w-8 h-8 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className={`${textMuted} text-sm font-medium`}>No items selected</p>
              <p className={`${textMuted} text-xs text-center px-6`}>
                Click on a product to add it to the order
              </p>
            </div>
          ) : (
            cart.map(item => (
              <CartRow
                key={item.id}
                item={item}
                onInc={() => changeQty(item.id, 1)}
                onDec={() => changeQty(item.id, -1)}
                onRemove={() => removeItem(item.id)}
                dark={dark}
                rowBg={rowBg}
                textPrimary={textPrimary}
                textMuted={textMuted}
              />
            ))
          )}
        </div>
        <div className={`border-t ${borderColor} px-4 py-3 space-y-2 shrink-0`}>
          {[
            ["Subtotal", `$${subtotal.toFixed(2)}`],
            ["Tax", "$0.00"],
            ["Discount", "$0.00"],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className={textSub}>{label}</span>
              <span className={dark ? "text-slate-300" : "text-slate-600"}>{val}</span>
            </div>
          ))}
          <div className={`flex justify-between items-center pt-2 border-t border-dashed ${dark ? "border-slate-700" : "border-slate-300"}`}>
            <span className={`font-bold ${textPrimary}`}>Total Payable</span>
            <span className="font-bold text-lg text-blue-500">${subtotal.toFixed(2)}</span>
          </div>
        </div>
        <div className="px-4 pb-5 shrink-0">
          <button
            disabled={cart.length === 0}
            onClick={handlePlaceOrder}
            className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-150 ${cart.length === 0
              ? dark
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 active:scale-95"
              }`}
          >
            {cart.length === 0 ? "No Items Selected" : `Place Order · $${subtotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────
interface ProductRowProps {
  product: Product; cartItem: CartItem | undefined;
  onAdd: (p: Product) => void; dark: boolean;
  productBg: string; borderColor: string;
  textPrimary: string; textSub: string; textMuted: string; imgFallback: string;
}

function ProductRow({
  product, cartItem, onAdd, dark,
  productBg, borderColor, textPrimary, textSub, textMuted, imgFallback,
}: ProductRowProps) {
  const outOfStock = (product.stock ?? 0) <= 0;
  // Safe fallbacks so the card never collapses on bad data
  const productName = product.name || "—";
  const productPrice = isNaN(Number(product.price)) ? 0 : Number(product.price);
  const productStock = product.stock ?? 0;

  return (
    <div
      onClick={() => !outOfStock && onAdd(product)}
      style={{ minHeight: "110px" }} // ← hard floor; card never collapses
      className={`flex items-stretch rounded-2xl overflow-hidden border transition-all duration-200 select-none
        ${outOfStock ? "cursor-not-allowed" : "cursor-pointer"}
        ${productBg} ${borderColor}
        ${cartItem
          ? "ring-2 ring-blue-500 border-blue-500/40 shadow-md shadow-blue-500/10"
          : dark
            ? "hover:border-slate-600 hover:shadow-lg hover:shadow-black/20"
            : "hover:border-slate-300 hover:shadow-md hover:shadow-black/5"
        }
        ${outOfStock ? "opacity-60" : ""}
      `}
    >
      {/* Left: image */}
      <div
        className={`relative w-[130px] shrink-0 ${dark ? "bg-slate-800" : "bg-slate-100"}`}
        style={{ minHeight: "110px" }}
      >
        <img
          src={product.imageProduct || imgFallback}
          alt={productName}
          className="w-full h-full object-cover"
          style={{ minHeight: "110px", maxHeight: "130px" }}
          onError={e => { (e.target as HTMLImageElement).src = imgFallback; }}
        />
        {cartItem && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md">
            ×{cartItem.qty}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white bg-red-500/90 px-2 py-1 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Right: info */}
      <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
        <div>
          {product.category?.name && (
            <p className={`text-[11px] font-medium ${textMuted} mb-0.5`}>
              {product.category.name}
            </p>
          )}
          <p className={`text-sm font-bold ${textPrimary} leading-snug line-clamp-2`}>
            {productName}
          </p>
          {product.sku && (
            <p className={`text-[11px] ${textMuted} mt-0.5 font-mono`}>{product.sku}</p>
          )}
        </div>
        {/* Price + stock badge — always rendered */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-base font-extrabold text-sky-500">
            ${productPrice.toFixed(2)}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${productStock > 0
            ? dark ? "bg-emerald-900/50 text-emerald-400" : "bg-emerald-100 text-emerald-700"
            : dark ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
            }`}>
            {productStock > 0 ? productStock : "0"}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <div className={`w-8 shrink-0 flex items-center justify-center ${cartItem ? "text-blue-400" : dark ? "text-slate-700" : "text-slate-200"
        }`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ─── Cart Row ─────────────────────────────────────────────────────────────────
interface CartRowProps {
  item: CartItem; onInc: () => void; onDec: () => void; onRemove: () => void;
  dark: boolean; rowBg: string; textPrimary: string; textMuted: string;
}

function CartRow({ item, onInc, onDec, onRemove, dark, rowBg, textPrimary, textMuted }: CartRowProps) {
  const btnBase = dark
    ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
    : "bg-slate-200 hover:bg-slate-300 text-slate-700";
  return (
    <div className={`${rowBg} rounded-xl px-3 py-2.5 flex items-center gap-3 transition-colors duration-200`}>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${textPrimary} truncate`}>{item.name}</p>
        <p className="text-xs font-bold text-sky-500 mt-0.5">
          ${(item.price * item.qty).toFixed(2)}
          <span className={`${textMuted} font-normal ml-1 text-[11px]`}>
            (${Number(item.price).toFixed(2)} × {item.qty})
          </span>
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onDec}
          className={`w-7 h-7 rounded-lg ${btnBase} font-bold text-lg flex items-center justify-center transition-colors leading-none`}>
          −
        </button>
        <span className={`w-7 text-center text-sm font-bold ${textPrimary} select-none`}>{item.qty}</span>
        <button onClick={onInc}
          className={`w-7 h-7 rounded-lg ${dark ? "bg-slate-700 hover:bg-blue-600 text-slate-200"
            : "bg-slate-200 hover:bg-blue-500 hover:text-white text-slate-700"
            } font-bold text-lg flex items-center justify-center transition-colors leading-none`}>
          +
        </button>
        <button onClick={onRemove}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ml-0.5 ${dark ? "bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white"
            : "bg-slate-200 hover:bg-red-500 text-slate-500 hover:text-white"
            }`}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = size === "sm" ? "w-5 h-5 border-2" : size === "lg" ? "w-9 h-9 border-[3px]" : "w-7 h-7 border-2";
  return <div className={`${cls} rounded-full border-slate-300 border-t-blue-500 animate-spin`} />;
}