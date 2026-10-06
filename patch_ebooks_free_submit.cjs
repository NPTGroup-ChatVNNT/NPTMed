const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

code = code.replace(
  'school: school === \'other\' && customSchool.trim() !== \'\' ? customSchool.trim() : school,\n      category,',
  'school: school === \'other\' && customSchool.trim() !== \'\' ? customSchool.trim() : school,\n      category: \'Tài Liệu Tham Khảo\','
);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
