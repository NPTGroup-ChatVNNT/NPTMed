const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'function getGeminiClient() {',
  'function getGeminiClient(customApiKey?: string) {\n  if (customApiKey && customApiKey.trim() !== "") {\n    return new GoogleGenAI({\n      apiKey: customApiKey,\n      httpOptions: { headers: { "User-Agent": "aistudio-build" } }\n    });\n  }'
);

code = code.replace(
  'const { message, history, availableEbooks, availableVideos } = req.body;',
  'const { message, history, availableEbooks, availableVideos, personalApiKey } = req.body;'
);

code = code.replace(
  'const ai = getGeminiClient();',
  'const ai = getGeminiClient(personalApiKey);'
);

fs.writeFileSync('server.ts', code);
