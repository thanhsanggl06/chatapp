const formidable = require("formidable");
const validator = require("validator");
const registerModel = require("../models/authModel");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";

module.exports.userRegister = (req, res) => {
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    const { username, email, password, confirmPassword, gender, birthday } = fields;
    const { image } = files;

    const error = [];

    //validation
    if (!username) {
      error.push("Vui lòng cung cấp tên người dùng");
    }
    if (!email) {
      error.push("Vui lòng cung cấp email");
    }
    if (email && !validator.isEmail(email)) {
      error.push("Email không hợp lệ");
    }
    if (!birthday) {
      error.push("Vui lòng cung cấp ngày sinh");
    }
    if (birthday) {
      const birthdayValid = new Date(birthday);
      const currentDate = new Date();

      const age = currentDate.getFullYear() - birthdayValid.getFullYear();

      if (age < 12) {
        error.push("Bạn chưa đủ tuổi để đăng ký");
      } else if (age == 12) {
        const currentMonth = currentDate.getMonth();
        const birthMonth = birthdayValid.getMonth();
        const currentDay = currentDate.getDate();
        const birthDay = birthdayValid.getDate();
        if (currentMonth > birthMonth || (currentMonth === birthMonth && currentDay >= birthDay)) {
        } else {
          error.push("Bạn chưa đủ tuổi để đăng ký");
        }
      }
    }
    if (!password) {
      error.push("Bạn chưa nhập mật khẩu");
    }
    if (!confirmPassword) {
      error.push("Bạn chưa xác nhận mật khẩu");
    }
    if (password && confirmPassword && password !== confirmPassword) {
      error.push("Xác nhận mật khẩu không đúng!");
    }
    if (password && password.length < 6) {
      error.push("Mật khẩu phải có ít nhất 6 kí tự");
    }
    // if (Object.keys(files).length === 0) {
    //   error.push("Please provide user image");
    // }

    // If invalid
    if (error.length > 0) {
      res.status(400).json({
        error: {
          errorMessage: error,
        },
      });
    }
    // if valid data
    else {
      // if default avatar
      if (Object.keys(files).length === 0) {
        try {
          // check user existing
          const checkUser = await registerModel.findOne({
            email: email,
          });

          //if user existing
          if (checkUser) {
            res.status(404).json({
              error: {
                errorMessage: ["Email bạn sử dụng đã tồn tại trong hệ thống!"],
              },
            });
          } else {
            // add user to db
            const userCreate = await registerModel.create({
              username,
              email,
              birthday,
              gender,
              password: await bcrypt.hash(password, 10),
              image: fields.image,
            });

            // generate jwt token
            const token = jwt.sign(
              {
                id: userCreate._id,
                email: userCreate.email,
                username: userCreate.username,
                image: userCreate.image,
                gender: userCreate.gender,
                birthday: userCreate.birthday,
              },
              process.env.SECRET,
              {
                expiresIn: process.env.TOKEN_EXP,
              }
            );

            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 7);

            res.status(201).cookie("authToken", token, { expires: expirationDate }).json({
              successMessage: "Đăng ký thành công!",
              token: token,
            });
          }
        } catch (error) {
          res.status(500).json({
            error: {
              errorMessage: ["Internal Server Error"],
            },
          });
        }
      } else {
        const getImageName = files.image.originalFilename;
        const randNumber = Math.floor(Math.random() * 99999);
        const newImageName = randNumber + getImageName;
        files.image.originalFilename = newImageName;

        const newPath = __dirname + `../../../frontend/public/image/${files.image.originalFilename}`;

        try {
          // check user existing
          const checkUser = await registerModel.findOne({
            email: email,
          });

          //if user existing
          if (checkUser) {
            res.status(404).json({
              error: {
                errorMessage: ["Email bạn sử dụng đã tồn tại trong hệ thống!"],
              },
            });
          } else {
            AWS.config.update({
              region: process.env.REGION,
              accessKeyId: process.env.ACCESS_KEY_ID,
              secretAccessKey: process.env.SECRET_ACCESS_KEY,
            });
            const s3 = new AWS.S3();

            //to do upload image to S3
            const paramsS3 = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: newImageName,
              Body: fs.readFileSync(files.image.filepath),
              ContentType: files.image.mimetype,
            };
            s3.upload(paramsS3, async (err, data) => {
              if (!err) {
                // add user to db
                const userCreate = await registerModel.create({
                  username,
                  email,
                  birthday,
                  gender,
                  password: await bcrypt.hash(password, 10),
                  image: files.image.originalFilename,
                });

                // generate jwt token
                const token = jwt.sign(
                  {
                    id: userCreate._id,
                    email: userCreate.email,
                    username: userCreate.username,
                    image: userCreate.image,
                    gender: userCreate.gender,
                    birthday: userCreate.birthday,
                  },
                  process.env.SECRET,
                  {
                    expiresIn: process.env.TOKEN_EXP,
                  }
                );

                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);

                res.status(201).cookie("authToken", token, { expires: expirationDate }).json({
                  successMessage: "Đăng ký thành công!",
                  token: token,
                });
              }
              // copy file image fail
              else {
                res.status(500).json({
                  error: {
                    errorMessage: ["Internal Server Error"],
                  },
                });
              }
            });
            // fs.copyFile(files.image.filepath, newPath, async (error) => {
            //   // if copy file image success

            // });
          }
        } catch (error) {
          res.status(500).json({
            error: {
              errorMessage: ["Internal Server Error"],
            },
          });
        }
      }
    }
  });
};

//Login Handle
module.exports.userLogin = async (req, res) => {
  const error = [];
  // console.log(req);
  const { email, password } = req.body;
  if (!email) {
    error.push("Vui lòng cung cấp email");
  }
  if (email && !validator.isEmail(email)) {
    error.push("Email không hợp lệ");
  }
  if (!password) {
    error.push("Bạn chưa nhập mật khẩu");
  }
  if (password && password.length < 6) {
    error.push("Mật khẩu phải có ít nhất 6 kí tự");
  }

  // If invalid
  if (error.length > 0) {
    res.status(400).json({
      error: {
        errorMessage: error,
      },
    });
  }
  // if valid
  else {
    try {
      // check user existing
      const checkUser = await registerModel
        .findOne({
          email: email,
        })
        .select("+password");

      //user existing
      if (checkUser) {
        const matchPassword = await bcrypt.compare(password, checkUser.password);

        if (matchPassword) {
          // generate jwt token
          const token = jwt.sign(
            {
              id: checkUser._id,
              email: checkUser.email,
              username: checkUser.username,
              image: checkUser.image,
              gender: checkUser.gender,
              birthday: checkUser.birthday,
            },
            process.env.SECRET,
            {
              expiresIn: process.env.TOKEN_EXP,
            }
          );

          //expire cookie time
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7);

          //response token and save token in cookie
          res.status(201).cookie("authToken", token, { expires: expirationDate }).json({
            successMessage: "Đăng nhập thành công!",
            token: token,
          });
        }
        // if no match password
        else {
          res.status(400).json({
            error: {
              errorMessage: ["Mật khẩu không hợp lệ"],
            },
          });
        }
      }
      // If user not found
      else {
        res.status(400).json({
          error: {
            errorMessage: ["Email của bạn chưa đăng ký tài khoản"],
          },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: {
          errorMessage: ["Internal server error"],
        },
      });
    }
  }
};

module.exports.checkVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await registerModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json({ verification: user.verification });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: {
        errorMessage: ["Internal server error"],
      },
    });
  }
};

module.exports.sendVerifyCode = async (req, res) => {
  try {
    const myId = req.myId;
    const user = await registerModel.findById(myId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const verifyCode = await user.generateVerificationCode();

    //TO DO: Send Email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MY_EMAIL, // địa chỉ email của bạn
      // to: user.email, // địa chỉ email của người nhận
      to: "thanhsangglp06@gmail.com",
      subject: "TEST - Mã xác minh ứng dụng Chatiuh",
      text: `Mã xác minh của bạn là: ${verifyCode}`, // Nội dung email
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Gửi email thất bại:", error);
        res.status(500).json({ message: ["Gửi email thất bại, vui lòng thử lại sau!"], success: false });
      } else {
        console.log("Email đã được gửi:", info.response);
        res.status(200).json({ message: "Mã xác minh đã được gửi", success: true });
      }
    });
  } catch (error) {
    res.status(500).json({ message: ["Gửi email thất bại, vui lòng thử lại sau!"], success: false, verification: false });
  }
};

module.exports.checkVerificationCode = async (req, res) => {
  try {
    const { code } = req.body;
    const myId = req.myId;

    const user = await registerModel.findById(myId).select("+verificationCode +verificationCodeExpires");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.checkVerificationCode(code);
    res.status(200).json({ message: "Xác thực tài khoản thành công", verification: true, success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: [error.message], success: false, verification: false });
  }
};

module.exports.userLogout = async (req, res) => {
  res.status(200).cookie("authToken", "").json({
    success: true,
  });
};
