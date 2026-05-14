function isAgentManager(req, res, next) {
  if (req.user.role !== "IT Agent Manager") {
    return res.status(403).json({ message: "Access denied. Agent Manager only." });
  }
  next();
}

module.exports = { isAgentManager };