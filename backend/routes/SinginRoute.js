const bcrypt = require("bcryptjs");
const Joi = require("joi");
const express = require("express");

const { User } = require("../models/User");
const generateAuthToken = require("../utils/genAuthToken");

const router = express.Router();

router.post("/", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email().messages({
      "string.base": "Email must be a string",
      "string.min": "Email en az 5 karakter olmalıdır",
      "string.max": "Email en fazla 255 karakter olmalıdır",
      "string.email": "Geçerli bir email adresi giriniz",
      "string.empty": "Email alanı boş bırakılamaz",
      "any.required": "Email alanı boş bırakılamaz",
    }),
    password: Joi.string().min(6).max(1024).required().messages({
      "string.base": "Password must be a string",
      "string.min": "Şifre en az 6 karakter olmalıdır",
      "string.max": "Şifre en fazla 1024 karakter olmalıdır",
      "string.empty": "Şifre alanı boş bırakılamaz",
      "any.required": "Şifre alanı boş bırakılamaz",
    }),
  });
  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });

  if (!user) return res.status(400).send("Yanlış email veya şifre");

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isValidPassword) return res.status(400).send("Yanlış email veya şifre");

  const token = generateAuthToken(user);

  res.send(token);
});

module.exports = router;
