const jwt = require("jsonwebtoken");

module.exports.authMiddleware = async (req, res, next) => {
  let authToken;
  // const { authToken } = req.cookies;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    authToken = req.headers.authorization.split(" ")[1];
  } else {
    authToken = req.cookies.authToken;
  }

  if (authToken) {
    try {
      const deCodeToken = await jwt.verify(authToken, process.env.SECRET);
      req.myId = deCodeToken.id;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).json({
        error: {
          errorMessage: ["Invalid token"],
        },
      });
    }
  } else {
    res.status(400).json({
      error: {
        errorMessage: ["Please Login first"],
      },
    });
  }
};
