const jwt = require("jsonwebtoken");
const { AppError } = require("./error");
const user = require("../../Models/user");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (token) {
      jwt.verify(token, process.env.jwt_sign, async (err, User) => {
        if (err) {
          return next(new AppError("token expired", 403));
        }

        const verifiedUser = await user.findOne({ email: User.email });
        if (verifiedUser.sessionTokens.indexOf(token) >= 0) {
          req.user = verifiedUser;
          next();
        } else {
          return next(new AppError("User logged out"), 401);
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
