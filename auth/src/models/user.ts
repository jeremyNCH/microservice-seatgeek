import mongoose from 'mongoose';
import { Password } from '../services/password';

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
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

/**
 * Interface that describes the properties that a User Document has
 */
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
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
 * run everytime before any save, therefore we need to limit this password hash middleware to be used only when a password change is created or updated
 * here we declare as async since mongoose still uses callbacks
 * we use the `function` keyword instead of a `fat-arrow` to get access to the userDoc with `this` keyword instead of the User.ts context
 * call done() when done to tell mongoose that we are done with the async work
 */
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
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

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
