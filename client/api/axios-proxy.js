import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // request from NextJS server
    return axios.create({
      baseURL: 'http://www.jeremyafoke.com/',
      headers: req && req.headers ? req.headers : {}
    });
  } else {
    // request from browser
    return axios.create();
  }
};
