const formidable = require("formidable");
const validator = require("validator");
const registerModel = require("../models/authModel");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
        error.push("You are not old enough to register");
      } else if (age == 12) {
        const currentMonth = currentDate.getMonth();
        const birthMonth = birthdayValid.getMonth();
        const currentDay = currentDate.getDate();
        const birthDay = birthdayValid.getDate();
        if (currentMonth > birthMonth || (currentMonth === birthMonth && currentDay >= birthDay)) {
        } else {
          error.push("You are not old enough to register");
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
    if (Object.keys(files).length === 0) {
      error.push("Please provide user image");
    }

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
          fs.copyFile(files.image.filepath, newPath, async (error) => {
            // if copy file image success
            if (!error) {
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
        }
      } catch (error) {
        res.status(500).json({
          error: {
            errorMessage: ["Internal Server Error"],
          },
        });
      }
    }
  });
};

//Login Handle
module.exports.userLogin = async (req, res) => {
  const error = [];
  console.log(req);
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
