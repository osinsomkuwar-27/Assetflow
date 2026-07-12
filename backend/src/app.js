const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./modules/auth/auth.routes');
const orgRoutes = require('./modules/org/org.routes');
const assetsRoutes = require('./modules/assets/assets.routes');
const allocationsRoutes = require('./modules/allocations/allocations.routes');
const bookingsRoutes = require('./modules/bookings/bookings.routes');
const maintenanceRoutes = require('./modules/maintenance/maintenance.routes');
const auditsRoutes = require('./modules/audits/audits.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const errorMiddleware = require('./shared/middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/allocations', allocationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/audits', auditsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorMiddleware);

module.exports = app;
