import { useState } from 'react';
import axios from 'axios';

export default () => {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [errors, seterrors] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/users/signup', {
        email,
        password
      });
    } catch (err) {
      seterrors(err.response.data.errors);
    }

    setemail('');
    setpassword('');
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <h1>Sign up</h1>
        <div className="form-group">
          <label>Email Address</label>
          <input
            value={email}
            onChange={(e) => setemail(e.target.value)}
            className="form-control"
          ></input>
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            type="password"
            className="form-control"
          ></input>
        </div>

        {errors.length > 0 && (
          <div className="alert alert-danger">
            <h4>Ooops....</h4>
            <ul className="my-0">
              {errors.map((err) => (
                <li key={err.message}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn btn-primary">Sign Up</button>
      </form>
    </div>
  );
};
