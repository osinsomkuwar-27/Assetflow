const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/db');

async function signup({ name, email, password, department }) {
  const existing = await prisma.employee.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      passwordHash,
      departmentId: department || null,
      role: 'Employee',
    },
  });

  return employee;
}

async function login({ email, password }) {
  const employee = await prisma.employee.findUnique({ where: { email } });
  if (!employee) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }
  if (employee.status === 'Inactive') {
    const err = new Error('Account is inactive. Contact your Admin.');
    err.statusCode = 403;
    throw err;
  }

  const match = await bcrypt.compare(password, employee.passwordHash);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: employee.id, role: employee.role, email: employee.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { token, employee };
}

module.exports = { signup, login };
