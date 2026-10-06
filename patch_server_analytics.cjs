const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const analyticsCode = `
// --- Analytics System ---
const trafficStats = {
  totalVisits: 0,
  uniqueUsers: new Set(),
  todayVisits: 0,
  lastReset: new Date().toDateString(),
};

app.post("/api/analytics/visit", (req, res) => {
  const { email } = req.body;
  
  const today = new Date().toDateString();
  if (trafficStats.lastReset !== today) {
    trafficStats.todayVisits = 0;
    trafficStats.uniqueUsers.clear();
    trafficStats.lastReset = today;
  }
  
  trafficStats.totalVisits++;
  trafficStats.todayVisits++;
  if (email) {
    trafficStats.uniqueUsers.add(email);
  }
  
  res.json({ success: true });
});

app.get("/api/analytics/stats", (req, res) => {
  res.json({
    totalVisits: trafficStats.totalVisits,
    todayVisits: trafficStats.todayVisits,
    activeUsersToday: trafficStats.uniqueUsers.size,
    uniqueUsersList: Array.from(trafficStats.uniqueUsers)
  });
});
// ------------------------

`;

code = code.replace('// 🩺 API Endpoint: AI Consultant (Hỏi đáp Trợ lý Y khoa NPTMed)', analyticsCode + '// 🩺 API Endpoint: AI Consultant (Hỏi đáp Trợ lý Y khoa NPTMed)');

fs.writeFileSync('server.ts', code);
