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
      error.push("Please provide your user name");
    }
    if (!email) {
      error.push("Please provide your Email");
    }
    if (email && !validator.isEmail(email)) {
      error.push("Please provide your Valid Email");
    }
    if (!birthday) {
      error.push("Please provide your birthday");
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
      error.push("Please provide your Password");
    }
    if (!confirmPassword) {
      error.push("Please provide your confirm Password");
    }
    if (password && confirmPassword && password !== confirmPassword) {
      error.push("Your Password and Confirm Password not same");
    }
    if (password && password.length < 6) {
      error.push("Please provide password mush be 6 charecter");
    }
    if (Object.keys(files).length === 0) {
      error.push("Please provide user image");
    }
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
              errorMessage: ["Your email already exited"],
            },
          });
        } else {
          fs.copyFile(files.image.filepath, newPath, async (error) => {
            if (!error) {
              const userCreate = await registerModel.create({
                username,
                email,
                birthday,
                gender,
                password: await bcrypt.hash(password, 10),
                image: files.image.originalFilename,
              });

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
                message: "Your regiter successful ",
                token: token,
              });

              console.log("registration Complete successfully");
            } else {
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
