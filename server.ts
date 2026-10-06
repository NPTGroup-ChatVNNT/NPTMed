import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Folder lưu trữ file tải lên trực tiếp trên server
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// Lazy-initialize Gemini client to avoid crashes if API key is missing
let aiClient: any = null;

function getGeminiClient(customApiKey?: string) {
  if (customApiKey && customApiKey.trim() !== "") {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
  }
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not set. Gemini integration will run in mock/educational mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}


// --- File System Storage for Analytics & Ebooks ---
import fs from "fs";

const ANALYTICS_FILE = path.join(process.cwd(), "server_analytics.json");
const EBOOKS_FILE = path.join(process.cwd(), "server_ebooks.json");

interface VisitLog {
  timestamp: number;
  date: string; // YYYY-MM-DD
  email?: string;
}

let visitLogs: VisitLog[] = [];
try {
  if (fs.existsSync(ANALYTICS_FILE)) {
    visitLogs = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
  }
} catch (e) {
  console.error("Error reading analytics file:", e);
}

function saveAnalytics() {
  try {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(visitLogs, null, 2));
  } catch (e) {
    console.error("Error saving analytics:", e);
  }
}

// Ebook DB helpers
function loadEbooks(): any[] {
  try {
    if (fs.existsSync(EBOOKS_FILE)) {
      return JSON.parse(fs.readFileSync(EBOOKS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading ebooks file:", e);
  }
  return [];
}

function saveEbooks(ebooks: any[]) {
  try {
    fs.writeFileSync(EBOOKS_FILE, JSON.stringify(ebooks, null, 2));
  } catch (e) {
    console.error("Error saving ebooks:", e);
  }
}

// 🛒 Products, Videos & Assessments DB helpers
const PRODUCTS_FILE = path.join(process.cwd(), "server_products.json");
const VIDEOS_FILE = path.join(process.cwd(), "server_videos.json");
const ASSESSMENTS_FILE = path.join(process.cwd(), "server_assessments.json");

function loadProducts(): any[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading products file:", e);
  }
  return [];
}

function saveProducts(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (e) {
    console.error("Error saving products:", e);
  }
}

function loadVideos(): any[] {
  try {
    if (fs.existsSync(VIDEOS_FILE)) {
      return JSON.parse(fs.readFileSync(VIDEOS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading videos file:", e);
  }
  return [];
}

function saveVideos(videos: any[]) {
  try {
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify(videos, null, 2));
  } catch (e) {
    console.error("Error saving videos:", e);
  }
}

function loadAssessments(): any[] {
  try {
    if (fs.existsSync(ASSESSMENTS_FILE)) {
      return JSON.parse(fs.readFileSync(ASSESSMENTS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading assessments file:", e);
  }
  return [
    {
      id: 'q1',
      title: 'Trắc nghiệm Giải phẫu học - Hệ Tuần hoàn',
      questionsCount: 20,
      timeLimit: '20 phút',
      level: 'Cơ bản',
      fileUrl: '#',
    },
    {
      id: 'q2',
      title: 'Tình huống Lâm sàng - Nhồi máu cơ tim cấp',
      questionsCount: 15,
      timeLimit: '30 phút',
      level: 'Nâng cao',
      fileUrl: '#',
    }
  ];
}

function saveAssessments(assessments: any[]) {
  try {
    fs.writeFileSync(ASSESSMENTS_FILE, JSON.stringify(assessments, null, 2));
  } catch (e) {
    console.error("Error saving assessments:", e);
  }
}

// 🔑 Key Orders Storage
const KEY_ORDERS_FILE = path.join(process.cwd(), "server_key_orders.json");

interface KeyOrder {
  id: string;
  email: string;
  proofImage: string;
  amount: number;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  issuedKey?: string;
  createdAt: number;
  createdAtStr: string;
}

function loadKeyOrders(): KeyOrder[] {
  try {
    if (fs.existsSync(KEY_ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(KEY_ORDERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading key orders file:", e);
  }
  return [];
}

function saveKeyOrders(orders: KeyOrder[]) {
  try {
    fs.writeFileSync(KEY_ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (e) {
    console.error("Error saving key orders:", e);
  }
}

// 📊 API Endpoint: Analytics Visit Tracker (Thu thập dữ liệu 1 tháng)
app.post("/api/analytics/visit", (req, res) => {
  const { email } = req.body;
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  visitLogs.push({
    timestamp: now.getTime(),
    date: dateStr,
    email: email && email.trim() !== "" ? email.trim().toLowerCase() : undefined,
  });

  // Keep last 60 days of logs to safely cover 1 month
  const sixtyDaysAgo = now.getTime() - 60 * 24 * 60 * 60 * 1000;
  visitLogs = visitLogs.filter((log) => log.timestamp >= sixtyDaysAgo);

  saveAnalytics();
  res.json({ success: true });
});

// 📊 API Endpoint: Analytics Stats (Thống kê 1 tháng cho Admin)
app.get("/api/analytics/stats", (req, res) => {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

  const logs30Days = visitLogs.filter((l) => l.timestamp >= thirtyDaysAgo);
  const logsToday = logs30Days.filter((l) => l.date === todayStr);

  const activeUsersTodaySet = new Set<string>();
  logsToday.forEach((l) => {
    if (l.email) activeUsersTodaySet.add(l.email);
  });

  const activeUsersMonthMap = new Map<string, { lastActive: number; visitCount: number }>();
  logs30Days.forEach((l) => {
    if (l.email) {
      const existing = activeUsersMonthMap.get(l.email) || { lastActive: l.timestamp, visitCount: 0 };
      activeUsersMonthMap.set(l.email, {
        lastActive: Math.max(existing.lastActive, l.timestamp),
        visitCount: existing.visitCount + 1,
      });
    }
  });

  // Daily chart data for past 30 days
  const dailyMap = new Map<string, { visits: number; users: Set<string> }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dStr = d.toISOString().split("T")[0];
    dailyMap.set(dStr, { visits: 0, users: new Set() });
  }

  logs30Days.forEach((l) => {
    if (dailyMap.has(l.date)) {
      const entry = dailyMap.get(l.date)!;
      entry.visits += 1;
      if (l.email) entry.users.add(l.email);
    }
  });

  const dailyChartData = Array.from(dailyMap.entries()).map(([date, data]) => {
    const parts = date.split("-");
    return {
      date: `${parts[2]}/${parts[1]}`,
      visits: data.visits,
      users: data.users.size,
    };
  });

  const monthlyUsersList = Array.from(activeUsersMonthMap.entries())
    .map(([email, data]) => ({
      email,
      lastActive: new Date(data.lastActive).toLocaleString("vi-VN"),
      lastActiveTs: data.lastActive,
      visitCount: data.visitCount,
    }))
    .sort((a, b) => b.lastActiveTs - a.lastActiveTs);

  const keyOrders = loadKeyOrders();
  const pendingOrdersCount = keyOrders.filter((o) => o.status === "pending").length;

  res.json({
    totalVisits: visitLogs.length,
    todayVisits: logsToday.length,
    monthlyVisits: logs30Days.length,
    activeUsersToday: activeUsersTodaySet.size,
    activeUsersMonth: activeUsersMonthMap.size,
    uniqueUsersList: Array.from(activeUsersTodaySet),
    monthlyUsersList,
    dailyChartData,
    keyOrders,
    pendingOrdersCount,
  });
});

// 🔑 API Endpoints: Key Orders (Khách Hàng Mua Key)
app.get("/api/key-orders", (req, res) => {
  const orders = loadKeyOrders();
  res.json(orders);
});

app.post("/api/key-orders", (req, res) => {
  const { email, proofImage, amount, note } = req.body;

  if (!email || !proofImage) {
    return res.status(400).json({ error: "Email và Ảnh minh chứng là bắt buộc" });
  }

  const orders = loadKeyOrders();
  const now = new Date();

  const newOrder: KeyOrder = {
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    email: email.trim().toLowerCase(),
    proofImage,
    amount: amount || 20000,
    note: note || "Mua Key Pro 20k/tháng",
    status: "pending",
    createdAt: now.getTime(),
    createdAtStr: now.toLocaleString("vi-VN"),
  };

  orders.unshift(newOrder);
  saveKeyOrders(orders);

  res.json({ success: true, order: newOrder });
});

app.patch("/api/key-orders/:id", (req, res) => {
  const { id } = req.params;
  const { status, issuedKey } = req.body;

  let orders = loadKeyOrders();
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Khống tìm thấy đơn hàng" });
  }

  orders[index].status = status || orders[index].status;
  if (issuedKey !== undefined) {
    orders[index].issuedKey = issuedKey;
  }

  saveKeyOrders(orders);
  res.json({ success: true, order: orders[index] });
});

app.get("/api/key-orders/user/:email", (req, res) => {
  const email = req.params.email.trim().toLowerCase();
  const orders = loadKeyOrders();
  const userOrders = orders.filter((o) => o.email === email);
  res.json(userOrders);
});

// 📁 API Endpoint: Tải file trực tiếp lưu trữ trên Server
app.post("/api/upload", (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: "Thành phần file hoặc dữ liệu không hợp lệ." });
    }
    const cleanBase64 = fileData.replace(/^data:.*?;base64,/, "");
    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(UPLOADS_DIR, safeFileName);
    fs.writeFileSync(filePath, Buffer.from(cleanBase64, "base64"));
    
    const fileUrl = `/uploads/${safeFileName}`;
    res.json({ success: true, fileUrl, fileName: safeFileName });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Lỗi lưu file trên hệ thống máy chủ." });
  }
});

// 📚 API Endpoints: Shared Ebooks Sync
app.get("/api/ebooks", (req, res) => {
  const ebooks = loadEbooks();
  res.json(ebooks);
});

app.post("/api/ebooks", (req, res) => {
  const newBook = req.body;
  let ebooks = loadEbooks();
  const index = ebooks.findIndex((b: any) => b.id === newBook.id);
  if (index >= 0) {
    ebooks[index] = newBook;
  } else {
    ebooks.unshift(newBook);
  }
  saveEbooks(ebooks);
  res.json(ebooks);
});

app.delete("/api/ebooks/:id", (req, res) => {
  const { id } = req.params;
  let ebooks = loadEbooks();
  ebooks = ebooks.filter((b: any) => b.id !== id);
  saveEbooks(ebooks);
  res.json(ebooks);
});

// 🛍️ API Endpoints: Products Sync
app.get("/api/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const newProduct = req.body;
  let products = loadProducts();
  const index = products.findIndex((p: any) => p.id === newProduct.id);
  if (index >= 0) {
    products[index] = newProduct;
  } else {
    products.unshift(newProduct);
  }
  saveProducts(products);
  res.json(products);
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  let products = loadProducts();
  products = products.filter((p: any) => p.id !== id);
  saveProducts(products);
  res.json(products);
});

// 🎬 API Endpoints: Videos Sync
app.get("/api/videos", (req, res) => {
  const videos = loadVideos();
  res.json(videos);
});

app.post("/api/videos", (req, res) => {
  const newVideo = req.body;
  let videos = loadVideos();
  const index = videos.findIndex((v: any) => v.id === newVideo.id);
  if (index >= 0) {
    videos[index] = newVideo;
  } else {
    videos.unshift(newVideo);
  }
  saveVideos(videos);
  res.json(videos);
});

app.delete("/api/videos/:id", (req, res) => {
  const { id } = req.params;
  let videos = loadVideos();
  videos = videos.filter((v: any) => v.id !== id);
  saveVideos(videos);
  res.json(videos);
});

// 📝 API Endpoints: Assessments Sync
app.get("/api/assessments", (req, res) => {
  const assessments = loadAssessments();
  res.json(assessments);
});

app.post("/api/assessments", (req, res) => {
  const newAssessment = req.body;
  let assessments = loadAssessments();
  const index = assessments.findIndex((a: any) => a.id === newAssessment.id);
  if (index >= 0) {
    assessments[index] = newAssessment;
  } else {
    assessments.unshift(newAssessment);
  }
  saveAssessments(assessments);
  res.json(assessments);
});

app.delete("/api/assessments/:id", (req, res) => {
  const { id } = req.params;
  let assessments = loadAssessments();
  assessments = assessments.filter((a: any) => a.id !== id);
  saveAssessments(assessments);
  res.json(assessments);
});
// ------------------------

// 🎬 API Endpoint: Tìm kiếm Video YouTube trực tiếp
app.get("/api/youtube/search", async (req, res) => {
  const query = (req.query.q as string || "").trim();
  if (!query) {
    return res.json([]);
  }

  try {
    const finalSearchQuery = query.toLowerCase().includes("y khoa") || query.toLowerCase().includes("bác sĩ") || query.toLowerCase().includes("med") 
      ? query 
      : `${query} y khoa`;

    const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(finalSearchQuery)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const html = await response.text();
    const jsonMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.*?});/s);
    const results: any[] = [];

    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        for (const item of contents) {
          if (item.videoRenderer) {
            const v = item.videoRenderer;
            const id = v.videoId;
            const title = v.title?.runs?.[0]?.text || "";
            const channel = v.ownerText?.runs?.[0]?.text || "";
            const desc = v.detailedMetadataSnippets?.[0]?.snippetText?.runs?.map((r: any) => r.text).join("") || v.descriptionSnippet?.runs?.[0]?.text || "";
            if (id && title) {
              results.push({
                id,
                title,
                channel,
                desc: desc || `Bài giảng y khoa từ kênh ${channel}`,
                thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
                url: `https://www.youtube.com/watch?v=${id}`
              });
            }
          }
        }
      } catch (jsonErr) {
        console.warn("JSON parse ytInitialData failed, falling back to regex", jsonErr);
      }
    }

    // Fallback regex if ytInitialData parsing was partial
    if (results.length === 0) {
      const idMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
      const uniqueIds = [...new Set(idMatches)].slice(0, 10);
      for (const id of uniqueIds) {
        results.push({
          id,
          title: `Bài giảng Y khoa (Mã: ${id})`,
          channel: "YouTube Y Khoa",
          desc: "Học liệu y khoa được tìm kiếm trực tiếp trên YouTube.",
          thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${id}`
        });
      }
    }

    res.json(results.slice(0, 15));
  } catch (err) {
    console.error("YouTube search error:", err);
    res.status(500).json({ error: "Lỗi tìm kiếm YouTube" });
  }
});

// 🎬 API Endpoint: Lấy thông tin video YouTube từ URL hoặc ID
app.get("/api/youtube/info", async (req, res) => {
  const urlOrId = (req.query.url as string || "").trim();
  if (!urlOrId) {
    return res.status(400).json({ error: "Thiếu URL hoặc ID" });
  }

  let ytid = urlOrId;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
  const match = urlOrId.match(regExp);
  if (match && match[2].length === 11) {
    ytid = match[2];
  }

  try {
    const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytid}`)}`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      if (data.title) {
        return res.json({
          id: ytid,
          title: data.title,
          channel: data.author_name || "YouTube",
          desc: `Bài giảng từ kênh: ${data.author_name || "YouTube"}. Trích dẫn học liệu chất lượng cao.`,
          thumbnail: `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${ytid}`
        });
      }
    }

    return res.json({
      id: ytid,
      title: `Bài Giảng Y Khoa (${ytid})`,
      channel: "YouTube",
      desc: "Trích dẫn học liệu y khoa từ YouTube.",
      thumbnail: `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${ytid}`
    });
  } catch (err) {
    console.error("YouTube info error:", err);
    return res.json({
      id: ytid,
      title: `Bài Giảng Y Khoa (${ytid})`,
      channel: "YouTube",
      desc: "Trích dẫn học liệu y khoa từ YouTube.",
      thumbnail: `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${ytid}`
    });
  }
});

// 🫀 API Endpoint: Phân Tích Điện Tâm Đồ AI (ECG/EKG Multimodal Analysis)
app.post("/api/gemini/ecg-analyze", async (req, res) => {
  const { image, notes, personalApiKey } = req.body;
  if (!image && (!notes || notes.trim() === "")) {
    return res.status(400).json({ error: "Vui lòng tải lên hình ảnh điện tim hoặc nhập thông số ghi nhận." });
  }

  try {
    const ai = getGeminiClient(personalApiKey);
    if (!ai) {
      return res.status(503).json({ error: "Hệ thống AI chưa được kích hoạt khóa API." });
    }

    const ecgSystemPrompt = `Bạn là Chuyên gia Tim mạch học & Đọc Điện tâm đồ (ECG/EKG) AI hàng đầu thuộc hệ sinh thái NPTMed sáng lập bởi Nguyễn Phi Trường.
NHIỆM VỤ CỦA BẠN: Phân tích bản ghi điện tim 12 chuyển đạo hoặc nhịp đồ của người dùng một cách chuẩn xác, cẩn trọng và khoa học.

QUY TẮC BẮT BUỘC SỐ 1 (ĐẶC BIỆT QUAN TRỌNG - KHÔNG ĐƯỢC PHÂN TÍCH ĐẠI KHI ẢNH MỜ):
- Nếu hình ảnh người dùng tải lên quá mờ, rung lắc, mất nét, chói lóa, bị cắt góc thiếu các chuyển đạo chính (D1-D3, aVR-aVF, V1-V6), độ phân giải quá thấp hoặc không thể nhìn rõ lưới milimet và các sóng P, QRS, T:
-> BẠN TUYỆT ĐỐI KHÔNG ĐƯỢC PHÂN TÍCH ĐẠI HOẶC ĐOÁN MÒ!
-> BẠN PHẢI TỪ CHỐI RÕ RÀNG VÀ YÊU CẦU:
"⚠️ HÌNH ẢNH ĐIỆN TIM CHƯA ĐỦ ĐỘ RÕ NÉT ĐỂ PHÂN TÍCH AN TOÀN:
Hình ảnh bạn tải lên bị [nêu rõ lý do: mờ/chói sáng/mất chuyển đạo/không rõ lưới milimet...]. Trong Tim mạch học, việc cố đọc một bản điện tim mờ có thể dẫn đến chẩn đoán sai lệch nghiêm trọng và nguy hiểm cho bệnh nhân.
👉 YÊU CẦU: Vui lòng chụp thẳng góc, đủ ánh sáng, lấy rõ toàn bộ 12 chuyển đạo và tải lại hình ảnh sắc nét hơn để AI có thể phân tích chính xác nhất."

NẾU HÌNH ẢNH ĐỦ RÕ NÉT HOẶC CÓ THÔNG SỐ ĐẦY ĐỦ:
Hãy tiến hành đọc bản ghi theo 7 bước chuẩn Tim mạch học quốc tế:
1. Nhịp tim: Nhịp xoang, rung nhĩ, cuồng nhĩ, nhịp nhanh kịch phát trên thất (SVT), ngoại tâm thu (thất/nhĩ)...
2. Tần số tim: ... chu kỳ/phút, đều hay không đều.
3. Trục điện tim: Trục trung gian, trục trái, trục phải hay vô định.
4. Sóng P & Khoảng PR: Thời gian PR, dấu hiệu dày nhĩ trái (P hai lá), dày nhĩ phải (P phế), block nhĩ thất (độ 1, độ 2 Mobitz I/II, độ 3).
5. Phức bộ QRS: Thời gian QRS, phì đại thất trái (tiêu chuẩn Sokolow-Lyon, Cornell), phì đại thất phải, block nhánh trái (LBBB), block nhánh phải (RBBB).
6. Đoạn ST & Sóng T: ST chênh lên/chênh xuống ở các chuyển đạo nào (định khu vùng nhồi máu cơ tim: trước vách V1-V2, trước mỏm V3-V4, thành bên V5-V6, thành dưới D2, D3, aVF...), sóng T âm/dẹt/nhọn đối xứng (thiếu máu cơ tim, tăng kali máu).
7. Khoảng QT/QTc & Kết luận sơ bộ: Nhận định hội chứng (STEMI, NSTEMI, thiếu máu cơ tim, rối loạn nhịp, bình thường...).
- Khuyến nghị theo dõi lâm sàng và cận lâm sàng tiếp theo (Men tim Troponin, Siêu âm tim Doppler...).
- LƯU Ý PHÁP LÝ & Y KHOA: Kết quả này chỉ mang tính chất tham khảo học tập và hỗ trợ quyết định, bắt buộc phải được đối chiếu lâm sàng và phê duyệt bởi Bác sĩ chuyên khoa Tim mạch.`;

    const parts: any[] = [{ text: `${ecgSystemPrompt}\n\nThông tin / Ghi chú lâm sàng kèm theo của người dùng: ${notes || "Không có ghi chú thêm."}` }];

    if (image) {
      const match = image.match(/^data:(image\/\w+);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: 'user', parts: parts }]
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("ECG Analysis Error:", err);
    res.status(500).json({ error: "Lỗi phân tích điện tim: " + (err.message || "Vui lòng thử lại sau.") });
  }
});

// 🩺 API Endpoint: AI Consultant (Hỏi đáp Trợ lý Y khoa NPTMed)
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history, availableEbooks, availableVideos, personalApiKey, image } = req.body;
  
  try {
    const ai = getGeminiClient(personalApiKey);
    
    // Create detailed prompt with context about NPTMed
    const systemInstruction = `Bạn là Trợ Lý Y Khoa AI NPTMed, được sáng lập bởi Nguyễn Phi Trường. Bạn là một chuyên gia y khoa AI xuất sắc. Bạn phải sử dụng NGÔN NGỮ ĐÚNG CHUẨN Y KHOA (chuẩn y khoa lâm sàng và cận lâm sàng), trả lời mượt mà, chuyên sâu và CỰC KỲ CHÍNH XÁC dựa trên Y Học Thực Chứng (Evidence-Based Medicine).
Đồng thời, hãy gợi ý học viên tham khảo các tài liệu Ebook hoặc Video đang có sẵn tại Thư viện NPTMed dựa trên danh sách sau:
Ebooks có sẵn: ${JSON.stringify(availableEbooks || [])}
Videos có sẵn: ${JSON.stringify(availableVideos || [])}

Nếu học viên hỏi về một chủ đề trùng khớp với tài liệu hoặc video đang có, hãy khuyên họ bấm vào tab tương ứng để xem tài liệu.
Nếu họ muốn tìm kiếm tài liệu nâng cao bên ngoài, hãy khuyên họ sử dụng thanh tìm kiếm nhanh Google trên trang chủ.
Hãy trả lời bằng Tiếng Việt chuẩn y khoa, thân thiện, chuyên nghiệp của một bác sĩ.`;

    if (!ai) {
      // Graceful fallback if API key is missing
      const mockResponses: { [key: string]: string } = {
        "hello": "Xin chào! Tôi là Trợ Lý Y Khoa NPTMed. Tôi có thể giúp gì cho việc nghiên cứu và học tập y khoa của bạn hôm nay?",
        "default": "Cảm ơn câu hỏi của bạn. Để nhận được tư vấn lâm sàng chi tiết và gợi ý tài liệu y khoa tự động bằng Trí Tuệ Nhân Tạo Gemini từ NPTMed, vui lòng cấu hình `GEMINI_API_KEY` trong bảng Secrets của AI Studio. \n\nHiện tại, bạn có thể tham khảo trực tiếp các đầu sách cực hay tại tab 'Trang Ebook Miễn Phí' và 'Trang Ebook Pro' như Atlas Giải Phẫu Netter hoặc Harrison Nội Khoa nhé!"
      };
      const query = (message || "").toLowerCase();
      let responseText = mockResponses.default;
      if (query.includes("chào") || query.includes("hello")) {
        responseText = mockResponses.hello;
      } else if (query.includes("giải phẫu") || query.includes("anatomy")) {
        responseText = "Chủ đề Giải phẫu học cực kỳ quan trọng! Tại NPTMed, chúng tôi có sẵn quyển **Atlas Giải Phẫu Người - Frank H. Netter** (bản tiếng Việt miễn phí) và các video học tập 3D giải phẫu tim tuần hoàn. Bạn hãy chuyển qua tab **Ebook Miễn Phí** hoặc **Video Học Liệu** để học tập ngay nhé!";
      } else if (query.includes("nội khoa") || query.includes("harrison") || query.includes("internal")) {
        responseText = "Về Nội khoa, NPTMed cung cấp bộ sách gối đầu giường **Harrison Nguyên lý Nội khoa (Harrison's Principles of Internal Medicine - 21st Edition)** bản Pro và **Sổ tay Lâm sàng Nội khoa Pocket Medicine**. Hãy truy cập tab **Ebook Pro** hoặc **Ebook Miễn Phí** để khám phá!";
      }
      return res.json({ text: responseText, source: 'mock' });
    }

    // Prepare Parts
    const parts: any[] = [{ text: `${systemInstruction}\n\nLịch sử trò chuyện:\n${JSON.stringify(history || [])}\n\nCâu hỏi mới: ${message}` }];
    
    if (image) {
      const match = image.match(/^data:(image\/\w+);base64,(.*)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    // Call real Gemini API
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { role: 'user', parts: parts }
        ]
      });
    } catch (apiError: any) {
      if (apiError.status === 503 || apiError.status === 404) {
        // Fallback to gemini-3.1-flash-lite
        console.log("Model 3.5-flash unavailable, trying 3.1-flash-lite...");
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [
            { role: 'user', parts: parts }
          ]
        });
      } else {
        throw apiError;
      }
    }

    res.json({ text: response.text, source: 'gemini' });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Fallback to mock responses if API fails (e.g. 503 Overloaded)
    const mockResponses: { [key: string]: string } = {
      "hello": "Xin chào! Tôi là Trợ Lý Y Khoa NPTMed. Tôi có thể giúp gì cho việc nghiên cứu và học tập y khoa của bạn hôm nay?",
      "default": "Hệ thống AI hiện đang xử lý quá nhiều yêu cầu. Trong lúc chờ đợi, bạn có thể tham khảo trực tiếp các đầu sách cực hay tại tab 'Trang Ebook Miễn Phí' và 'Trang Ebook Pro' như Atlas Giải Phẫu Netter hoặc Harrison Nội Khoa nhé!"
    };
    
    const query = (message || "").toLowerCase();
    let responseText = mockResponses.default;
    if (query.includes("chào") || query.includes("hello")) {
      responseText = mockResponses.hello;
    } else if (query.includes("giải phẫu") || query.includes("anatomy")) {
      responseText = "Chủ đề Giải phẫu học cực kỳ quan trọng! Tại NPTMed, chúng tôi có sẵn quyển **Atlas Giải Phẫu Người - Frank H. Netter** (bản tiếng Việt miễn phí) và các video học tập 3D giải phẫu tim tuần hoàn. Bạn hãy chuyển qua tab **Ebook Miễn Phí** hoặc **Video Học Liệu** để học tập ngay nhé!";
    } else if (query.includes("nội khoa") || query.includes("harrison") || query.includes("internal")) {
      responseText = "Về Nội khoa, NPTMed cung cấp bộ sách gối đầu giường **Harrison Nguyên lý Nội khoa (Harrison's Principles of Internal Medicine - 21st Edition)** bản Pro và **Sổ tay Lâm sàng Nội khoa Pocket Medicine**. Hãy truy cập tab **Ebook Pro** hoặc **Ebook Miễn Phí** để khám phá!";
    }
    
    res.json({ text: responseText, source: 'fallback' });
  }
});

// 📚 API Endpoint: AI Summarize Ebook (Tóm tắt sách tự động)
app.post("/api/gemini/summarize", async (req, res) => {
  const { title, author, description, category } = req.body;
  
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ 
        summary: `[Bản tóm tắt đề xuất] Cuốn sách "${title}" của tác giả ${author} là một tài liệu hữu ích thuộc danh mục chuyên khoa ${category}. Sách tập trung phân tích các khía cạnh lâm sàng, chẩn đoán và hướng dẫn thực hành chi tiết. (Cấu hình GEMINI_API_KEY để tạo tóm tắt thông minh đầy đủ hơn).`
      });
    }

    const prompt = `Bạn là một giáo sư y khoa giàu kinh nghiệm. Hãy viết một bài giới thiệu và tóm tắt chuyên môn y khoa ngắn gọn (khoảng 3-4 câu) và liệt kê 3 điểm cốt lõi người học sẽ thu nhận được từ cuốn sách sau:
Tên sách: ${title}
Tác giả: ${author}
Mô tả: ${description}
Chuyên khoa: ${category}

Trả lời bằng Tiếng Việt, trình bày mạch lạc, trang trọng.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
    } catch (apiError: any) {
      if (apiError.status === 503 || apiError.status === 404) {
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt
        });
      } else {
        throw apiError;
      }
    }

    res.json({ summary: response.text });
  } catch (error: any) {
    console.error("Gemini Summarize Error:", error);
    res.json({ 
      summary: `[Bản tóm tắt mặc định] Sách tập trung chia sẻ các kiến thức lâm sàng cốt lõi về ${category}, hỗ trợ hiệu quả cho việc nghiên cứu của Nguyễn Phi Trường và cộng sự.`
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
