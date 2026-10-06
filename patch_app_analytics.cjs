const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '  // Load state on mount\n  useEffect(() => {',
  `  // Analytics Tracker
  useEffect(() => {
    fetch('/api/analytics/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email })
    }).catch(console.error);
  }, [user]);

  // Load state on mount
  useEffect(() => {`
);

fs.writeFileSync('src/App.tsx', code);
