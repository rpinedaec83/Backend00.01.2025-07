import { sequelize } from './index.js';
import '../models/User.js';
import '../models/Package.js';
import '../models/PackageLocation.js';
import '../models/Message.js';

(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  console.log('DB synced');
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
