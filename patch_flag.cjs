const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

code = code.replace(
  'User, Calendar, Trash2, Edit, CheckCircle, Upload, Image as ImageIcon } from \'lucide-react\';',
  'User, Calendar, Trash2, Edit, CheckCircle, Upload, Image as ImageIcon, Flag } from \'lucide-react\';'
);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
