const authService = require('./auth.service');
const { ok, fail } = require('../../shared/utils/responseFormatter');

async function signup(req, res, next) {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password) {
      return fail(res, 'name, email, and password are required', 400);
    }
    const employee = await authService.signup({ name, email, password, department });
    return ok(res, { id: employee._id, name: employee.name, email: employee.email, role: employee.role }, 'Account created', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 'email and password are required', 400);
    }
    const { token, employee } = await authService.login({ email, password });
    return ok(res, {
      token,
      user: { id: employee._id, name: employee.name, email: employee.email, role: employee.role, department: employee.department },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // req.user set by authMiddleware
    return ok(res, req.user, 'Current session');
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, me };
