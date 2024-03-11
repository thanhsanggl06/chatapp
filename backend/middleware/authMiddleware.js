const jwt = require("jsonwebtoken");

module.exports.authMiddleware = async (req, res, next) => {
  let authToken;
  // const { authToken } = req.cookies;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    authToken = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.authToken) {
    authToken = req.cookies.authToken;
  }

  if (authToken) {
    const deCodeToken = await jwt.verify(authToken, process.env.SECRET);
    req.myId = deCodeToken.id;
    next();
  } else {
    res.status(400).json({
      error: {
        errorMessage: ["Please Login first"],
      },
    });
  }
};
