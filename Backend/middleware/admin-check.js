const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.userData.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Admin check failed.' });
  }
}; 