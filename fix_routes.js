const fs = require('fs');
const files = [
  'apps/api/src/routes/products.ts',
  'apps/api/src/routes/orders.ts',
  'apps/api/src/routes/customers.ts',
  'apps/api/src/routes/inventory.ts',
  'apps/api/src/routes/discounts.ts',
  'apps/api/src/routes/apps.ts'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ successResponse \} from '\.\.\/utils\/response';/g, "import { sendSuccess } from '../utils/response';");
  // Replace res.json(successResponse(var)) with sendSuccess(res, var)
  content = content.replace(/res\.json\(successResponse\(([^)]+)\)\);/g, "sendSuccess(res, $1);");
  fs.writeFileSync(file, content);
}
console.log('Fixed routes!');
