import mongoose from 'mongoose';

/**
 * Interface that describes the properties required to create a new user
 */

interface UserAttrs {
  email: string;
  password: string;
}

/**
 * Interface that describes properties that a User model has
 */

interface UserModel extends mongoose.Model<any> {
  build(attrs: UserAttrs): any;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

/**
 *
 * @param attrs user arguments as described in UserAttrs
 * Add build function to UserModel/mongoose prototype => User.build(Attrs)
 * Build pattern to make sure TS checks User attrs
 */

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<any, UserModel>('User', userSchema);

User.build({
  email: 'test@test.com',
  password: 'password'
});

export { User };
