import axios from 'axios';

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // request from NextJS server
    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      headers: req.headers
    });
  } else {
    // request from browser
    return axios.create();
  }
};
