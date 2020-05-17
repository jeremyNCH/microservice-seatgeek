import axiosProxy from '../api/axios-proxy';

/**
 *
 * @param {props} object
 * This function runs inside the brower
 * we cannot fetch request and update the state of this component since it only renders once during 1 SSR cycle
 * we need to fetch data from the NextJS server in getInitialProps
 */
const LandingPage = ({ currentUser }) => {
  return <h1>Landing page</h1>;
};

/**
 * Here this code runs on the NextJS server that build the full HTML file to be rendered
 * Here we make the fetch data request and return it as a component `props` object inside the component
 * GOTCHA: getInitialProps will always run on the server on a hard reload/refresh/First time access/click on external domain link
 *         getInitialProps will run in the browser if we navigate from 1 page to another while inside the app/use next.js router
 */
LandingPage.getInitialProps = async (context) => {
  const { data } = await axiosProxy(context).get('/api/users/currentuser');
  return data;
};

export default LandingPage;
