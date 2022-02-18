//Importing modules
const {
  signupValidate,
  loginValidate,
  resetValidate,
} = require("../Models/validate");
const user = require("../Models/user");
const crypto = require("crypto");
const { SendVerificationEmail, SendPasswordEmail } = require("./misc/email");
const uniqueAuthString = () => crypto.randomBytes(64).toString("hex");
const bcrypt = require("bcrypt");
const { AppError } = require("./misc/error");
const jwt = require("jsonwebtoken");
//avoiding try catch

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next);
  };
};

//SignUp Logic
exports.signup = catchAsync(async (req, res, next) => {
  //extracting the user credentials
  const { username, email, password, confirmPassword } = req.body;
  //Validating acccording to validation rules
  const { error } = signupValidate(req.body);
  if (error) {
    return res.send(error.details[0].message);
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 404));
  }
  //Checking if the user already exists
  const DuplicateUser = await user.findOne({ email: email });
  if (DuplicateUser) {
    //res.send("User already exists");
    return next(new AppError("The user already exists", 404));
  }
  //Hashing the password
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);
  const uniqueStr = uniqueAuthString();
  //Saving the user in database
  const User = new user({
    username: username,
    email: email,
    password: encryptedPassword,
    uniqueString: uniqueStr,
    date: Date.now() + 300000,
  });

  await User.save();
  res.status(201).json({
    sucees: true,
    error: false,
    message: "User Created!!",
  });

  SendVerificationEmail(uniqueStr, email);
});

//Email verification logic
exports.verify = catchAsync(async (req, res) => {
  const date = Date.now();
  const { token } = req.params;
  const User = await user.findOne({
    uniqueString: token,
    date: { $gte: date },
  });
  if (!User) {
    return next(new AppError("Token expired", 404));
  }

  User.isvalid = true;
  await User.save();
  return res.send("User verified");
});

//Login route
exports.login = catchAsync(async (req, res, next) => {
  const { userId, password } = req.body;
  const { error } = loginValidate(req.body);
  if (error) {
    return res.send(error.details[0].message);
  }

  let RUser = await user.findOne({ email: userId });
  if (!RUser) {
    RUser = await user.findOne({ username: userId });
  }

  if (!RUser) {
    return next(new AppError("User not found", 404));
  }

  if (RUser.isvalid == true) {
    const pass2 = RUser.password;
    bcrypt.compare(password, pass2, (err, data) => {
      if (err) {
        console.log(err);
      }
      if (data) {
        const token = jwt.sign({ email: RUser.email }, process.env.jwt_sign, {
          expiresIn: "2h",
        });

        RUser.sessionTokens.push(token);
        RUser.save();

        return res.json({ authorization: token });
      } else {
        return res.send("chal nikl glt password wale");
      }
    });
  }
});

//User retrievng his favourites
exports.detail = catchAsync(async (req, res, next) => {
  let users = req.user;
  res.send(users.username);
});

//refreshing the short-lived token

//forget password route
exports.forGet = catchAsync(async (req, res, next) => {
  let User = await user.findOne({ username: req.body.userId });
  if (!User) {
    User = await user.findOne({ email: req.body.userId });
  }
  if (!User) {
    return next(new AppError("user not found..Plesase signup", 403));
  }

  const token = jwt.sign({ userId: User.email }, process.env.forget_sign, {
    expiresIn: "2h",
  });

  SendPasswordEmail(token, User.email);

  res.send(token);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!(password && confirmPassword)) {
    return next(new AppError("Enter the new password", 403));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 403));
  }

  const findToken = await user.findOne({ blacklist: { $all: [token] } });
  if (findToken) {
    return res.send("Token used");
  }
  jwt.verify(token, process.env.forget_sign, async (err, User) => {
    if (err) {
      return res.send("Invalid token");
    }
    console.log(User);

    const expireToken = await user.findOne({ email: User.userId });

    expireToken.blacklist.push(token);
    await expireToken.save();
    const newPassword = password.toString();
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(newPassword, parseInt(salt));

    user
      .updateOne(
        { email: User.userId },
        {
          password: encryptedPassword,
        }
      )
      .then((result) => {
        return res.send("Password changed");
      });
  });
});

//Reset profile details route
exports.ResetDetails = catchAsync(async (req, res, next) => {
  const { neWusername, oldEmail, newEmail, password } = req.body;
  const { error } = resetValidate({ oldEmail, newEmail });
  if (error) {
    return res.send(error.details[0].message);
  }
  let users = req.user;

  if (!(password && oldEmail)) {
    return next(
      new AppError(
        "You have to enter your password and email to change user details",
        403
      )
    );
  }

  bcrypt.compare(password, users.password, (err, data) => {
    if (err) {
      console.log(err);
    }
    if (data) {
      if (neWusername && neWusername.length > 6) {
        user
          .updateOne(
            { email: users.email },
            {
              username: neWusername,
            }
          )
          .then((result) => {
            console.log("username changed");
          });
      }

      if (newEmail) {
        user
          .updateOne(
            { email: users.email },
            {
              email: newEmail,
            }
          )
          .then((result) => {
            //console.log("email changed");
            return res.send("credentials changed");
          });
      }
    } else {
      return next(new AppError("Nikal glti password wale", 403));
    }
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  const authToken = req.headers["authorization"].split(" ")[1];
  let users = req.user;
  let filtered = [];
  users.sessionTokens.map((el) => {
    if (el !== authToken) {
      filtered.push(el);
    }
  });

  users.sessionTokens = filtered;

  await users.save();
  return res.send("User logged out");
});
