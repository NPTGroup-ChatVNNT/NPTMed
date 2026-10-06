const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import AdminDashboardView')) {
  code = code.replace(
    'import AssistantView from \'./components/AssistantView\';',
    'import AssistantView from \'./components/AssistantView\';\nimport AdminDashboardView from \'./components/AdminDashboardView\';'
  );
  
  code = code.replace(
    'case \'assistant\':\n        return (\n          <AssistantView',
    'case \'admin\':\n        return <AdminDashboardView />;\n      case \'assistant\':\n        return (\n          <AssistantView'
  );

  fs.writeFileSync('src/App.tsx', code);
}
