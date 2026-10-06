const fs = require('fs');
let code = fs.readFileSync('src/components/EbooksFreeView.tsx', 'utf8');

code = code.replace(
  "{ value: 'other', label: 'Khác' }",
  "{ value: 'other', label: 'Khác' },\n  { value: 'Tài Liệu Tham Khảo', label: 'Tài Liệu Tham Khảo' }"
);

fs.writeFileSync('src/components/EbooksFreeView.tsx', code);
