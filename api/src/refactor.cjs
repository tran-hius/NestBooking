const fs = require('fs');
let content = fs.readFileSync('app.ts', 'utf8').split('\n');

content.splice(19, 5, 'import { setupSwaggerUi } from "@/config/swagger-ui";');
content = content.filter(line => !line.includes('const __filename') && !line.includes('const __dirname'));

const startIndex = content.findIndex(line => line.includes('const userSwaggerDoc = JSON.parse('));
let endIndex = content.findIndex(line => line.includes('swaggerUi.setup(undefined, swaggerOptions),'));

if (startIndex !== -1 && endIndex !== -1) {
    content.splice(startIndex, endIndex - startIndex + 2, 'setupSwaggerUi(app);');
}

fs.writeFileSync('app.ts', content.join('\n'));
