const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
    let token = req.header("Authorization") || req.body.token || req.cookies.token;
    if (token && token.startsWith("Bearer ")) {
      token = token.replace("Bearer ", "");
    }
    
    if (!token) {
      return res.status(401).json({
          message: "Access Denied. No token provided."
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({
        message: "Token is not valid",
        success: false,
        error: err.message
    });
    }
};

exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied"
      });
    }
    next();
  };
};