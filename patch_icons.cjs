const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '} from \'lucide-react\';',
  '  Activity,\n} from \'lucide-react\';'
);

// Add to navLinks
code = code.replace(
  '{ id: \'y-thu-quan\', label: \'Y Thư Quán\', icon: Library },\n  ];',
  '{ id: \'y-thu-quan\', label: \'Y Thư Quán\', icon: Library },\n    ...(user?.role === \'admin\' ? [{ id: \'admin\', label: \'Thống Kê Hệ Thống\', icon: Activity }] : []),\n  ];'
);

// We need to move navLinks inside the component where `user` is available.
// Let's see where navLinks is declared.
