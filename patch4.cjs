const fs = require('fs');
let code = fs.readFileSync('src/components/AssistantView.tsx', 'utf8');

code = code.replace(
  'const data = await response.json();\n      \n      setChatHistory(prev => [...prev, { role: \'model\', text: data.text }]);\n    } catch (error) {\n      setChatHistory(prev => [...prev, { role: \'model\', text: \'Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.\' }]);',
  `const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi kết nối');
      }
      
      setChatHistory(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'model', text: 'Xin lỗi, đã có lỗi xảy ra: ' + (error.message || 'Vui lòng thử lại sau.') }]);`
);

fs.writeFileSync('src/components/AssistantView.tsx', code);
