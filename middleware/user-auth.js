const jwt = require("jsonwebtoken");
const {AppError} = require("../Models/error");
const user = require("../Models/user");

module.exports = (req, res, next) => {
    try {
       
       const token = req.headers.authorization.split(" ")[1];
       
       if(token) {
          jwt.verify(token, process.env.jwt_sign, async (err, User) => {
              if(err){
                  return next(new AppError("token expired", 403));
              }else if(User){
                const loggedStatus = await user.findOne({blacklist: {$all: [token]}});
                if(loggedStatus){
                  return next(new AppError("You have logged out buddy"));
                }
                req.user = User;
                next();
              }else{
                return next(new AppError("auth failed", 404));
              }
              
              
          })
       };

    } catch (error) {
        next(error);
    }
    
}