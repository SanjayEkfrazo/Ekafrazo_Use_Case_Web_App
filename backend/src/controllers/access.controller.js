const accessService = require("../services/access.service");
const {
  getAccessSession,
  setAccessSessionCookie,
  clearAccessSessionCookie,
} = require("../middlewares/auth");

function signup(req, res) {
  try {
    const result = accessService.signupAccessUser(req.body || {});

    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }

    setAccessSessionCookie(res, result.data.id);

    return res.status(result.created ? 201 : 200).json({
      data: result.data,
      message: result.created ? "Signup completed" : "Signup details updated",
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to save signup details" });
  }
}

function signin(req, res) {
  try {
    const result = accessService.signinAccessUser(req.body || {});

    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }

    if (result.unauthorized) {
      return res.status(401).json({ message: result.message || "Invalid credentials" });
    }

    setAccessSessionCookie(res, result.data.id);
    return res.status(200).json({ data: result.data, message: "Signin successful" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to sign in" });
  }
}

function identify(req, res) {
  try {
    const result = accessService.identifyAccessUser(req.body || {});
    if (result.errors) {
      return res.status(400).json({ message: "Validation failed", errors: result.errors });
    }
    return res.status(200).json({ data: result.data });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to identify user" });
  }
}

function getSession(req, res) {
  try {
    const session = getAccessSession(req);
    if (!session?.accessUserId) {
      return res.status(200).json({ data: { authenticated: false } });
    }

    const user = accessService.getAccessUserById(session.accessUserId);
    if (!user) {
      clearAccessSessionCookie(res);
      return res.status(200).json({ data: { authenticated: false } });
    }

    return res.status(200).json({
      data: {
        authenticated: true,
        user: {
          id: user.id,
          full_name: user.full_name,
          work_email: user.work_email,
        },
      },
    });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to read access session" });
  }
}

function getAccessUsers(req, res) {
  try {
    const users = accessService.getAccessUsers({ limit: req.query.limit });
    return res.status(200).json({ data: users });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch access users" });
  }
}

function getAccessSigninLogs(req, res) {
  try {
    const logs = accessService.getAccessSigninLogs({ limit: req.query.limit });
    return res.status(200).json({ data: logs });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch access signin logs" });
  }
}

module.exports = {
  signup,
  signin,
  identify,
  getSession,
  getAccessUsers,
  getAccessSigninLogs,
};
