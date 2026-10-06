const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{ id: 'y-thu-quan', label: 'Y Thư Quán', icon: Library },\n  ];",
  "{ id: 'y-thu-quan', label: 'Y Thư Quán', icon: Library },\n    ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Thống Kê Hệ Thống', icon: Activity }] : [])\n  ];"
);

fs.writeFileSync('src/App.tsx', code);
