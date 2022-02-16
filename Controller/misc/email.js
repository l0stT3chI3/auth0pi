const nodemailer = require("nodemailer");

exports.SendVerificationEmail = (uniqueString, email) => {
  let transport = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: "l0stt3chi3@gmail.com",
      pass: process.env.gmail,
    },
  });

  let senderName = "Aryan Tiwari";

  let mailOptions = {
    from: senderName,
    to: email,
    subject: "Verify your account",
    html: `Click <a href= http://localhost:8080/api/verify/${uniqueString}>here</a> to verify your account`,
  };

  transport.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("message sent");
    }
  });
};

exports.SendPasswordEmail = (uniqueString, email) => {
  let transport = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: "l0stt3chi3@gmail.com",
      pass: process.env.gmail,
    },
  });

  let senderName = "Aryan Tiwari";

  let mailOptions = {
    from: senderName,
    to: email,
    subject: "Change your password",
    html: `Click <a href= http://localhost:8080/api/forgot/${uniqueString}>here</a> to change your password`,
  };

  transport.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("message sent");
    }
  });
};
