const express = require('express');
const router = express.Router();
const authMiddleware = require('../../shared/middleware/auth.middleware');
const requireRole = require('../../shared/middleware/role.middleware');
const { ok, fail } = require('../../shared/utils/responseFormatter');
const { prisma } = require('../../config/db');

router.use(authMiddleware);

router.post('/departments', requireRole('Admin'), async (req, res, next) => {
  try {
    const { name, code, head, parentDepartment } = req.body;
    const dept = await prisma.department.create({
      data: { name, code, headId: head || null, parentId: parentDepartment || null },
    });
    return ok(res, dept, 'Department created', 201);
  } catch (err) { next(err); }
});
router.get('/departments', async (req, res, next) => {
  try {
    const depts = await prisma.department.findMany({ include: { head: true, parent: true } });
    return ok(res, depts, 'Departments fetched');
  } catch (err) { next(err); }
});
router.put('/departments/:id', requireRole('Admin'), async (req, res, next) => {
  try {
    const { name, code, head, parentDepartment, status } = req.body;
    const dept = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(head && { headId: head }),
        ...(parentDepartment && { parentId: parentDepartment }),
        ...(status && { status }),
      },
    });
    return ok(res, dept, 'Department updated');
  } catch (err) { next(err); }
});

router.post('/categories', requireRole('Admin'), async (req, res, next) => {
  try {
    const { name, customFields } = req.body;
    const cat = await prisma.category.create({ data: { name, customFields: customFields || {} } });
    return ok(res, cat, 'Category created', 201);
  } catch (err) { next(err); }
});
router.get('/categories', async (req, res, next) => {
  try {
    const cats = await prisma.category.findMany();
    return ok(res, cats, 'Categories fetched');
  } catch (err) { next(err); }
});

router.get('/employees', requireRole('Admin'), async (req, res, next) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { department: true },
      select: undefined, 
    });
    const sanitized = employees.map(({ passwordHash, ...rest }) => rest);
    return ok(res, sanitized, 'Employees fetched');
  } catch (err) { next(err); }
});
router.put('/employees/:id/role', requireRole('Admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['Employee', 'DepartmentHead', 'AssetManager', 'Admin'].includes(role)) {
      return fail(res, 'Invalid role', 400);
    }
    const employee = await prisma.employee.update({ where: { id: req.params.id }, data: { role } });
    const { passwordHash, ...sanitized } = employee;
    return ok(res, sanitized, 'Role updated');
  } catch (err) { next(err); }
});
router.put('/employees/:id/status', requireRole('Admin'), async (req, res, next) => {
  try {
    const employee = await prisma.employee.update({ where: { id: req.params.id }, data: { status: req.body.status } });
    const { passwordHash, ...sanitized } = employee;
    return ok(res, sanitized, 'Status updated');
  } catch (err) { next(err); }
});

module.exports = router;
