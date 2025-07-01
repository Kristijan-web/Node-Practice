const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return /^[A-Z][A-z]*$/.test(value);
      },
      message: "Name must start with a capital letter",
    },
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email must be unique"],
  },
  photo: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    select: false, // nece biti prikazan u response-u
  },
  passwordConfirm: {
    type: String,
    required: true,
    validator: {
      validate: function (value) {
        return this.password === value; // proveravam da li je passwordConfirm isti kao password
      },
      message: "Password's do not match",
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  passwordResetToken: {
    type: String,
  },
  resetTokenValidateDuration: {
    type: Date,
  },
});

// Treba mi pre save document middleware da bih ukllonio passordConfirm polje  i da bih sifru hash-ovo

userSchema.pre("save", async function (next) {
  // mora da se hashuje password
  if (this.isModified("password")) {
    // i ako bi se sifra poslala samo na signup bolje da je bude wrapovano u this.isModified
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // uklanjam passwordConfirm polje sto znaci da nece biti sacuvano u bazi
  }

  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  // sta ako je korisnik izvrsio update ali nije promenio sifru??
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined; // uklanjam passwordConfirm polje sto znaci da nece biti sacuvano u bazi
  }
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  // e sada mora da se vrati true ili false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  // ako je timestamp u tokenu manji od changedPasswordAt onda znaci da je korisnik promenio sifru

  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // pretvaram u sekunde

    return JWTTimestamp < changedTimestamp; // ako je token stariji od changedPasswordAt onda je sifra promenjena
  }

  return false; // ovo znaci da sifra nije menjana
};

userSchema.methods.createUserToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // hashovan token treba da se cuva u bazi
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenValidateDuration = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("users", userSchema);

module.exports = User;
