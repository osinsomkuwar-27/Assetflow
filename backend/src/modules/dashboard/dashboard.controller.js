const svc = require('./dashboard.service');
const { ok } = require('../../shared/utils/responseFormatter');
const { prisma } = require('../../config/db');

async function getKPIs(req, res, next) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.user.id },
      select: { departmentId: true, role: true },
    });
    const data = await svc.getDashboardKPIs(
      req.user.id,
      req.user.role,
      employee ? employee.departmentId : null
    );
    return ok(res, data, 'Dashboard KPIs fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { getKPIs };
