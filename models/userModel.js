const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('node:crypto');

const userSchema = mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: 'String', required: true },
    email: { type: 'String', unique: true, required: true },
    password: { type: 'String', required: true },
    pic: {
      type: 'String',
      required: true,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = bcrypt.hash(this.password, salt);
  // console.log('the password encrypted by bcrypt: ', this.password);
  // console.log(
  //   'the password encrypted by crypto SHA256: ',
  //   crypto.createHmac('sha256', process.env.JWT_SECRET).update(this.password).digest('hex')
  // );
});

const User = mongoose.model('User', userSchema);

module.exports = User;
