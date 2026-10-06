const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '  Library\n} from \'lucide-react\';',
  '  Library,\n  Activity\n} from \'lucide-react\';'
);

fs.writeFileSync('src/App.tsx', code);
