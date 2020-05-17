import 'bootstrap/dist/css/bootstrap.css';
import axiosProxy from '../api/axios-proxy';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
};

/**
 * @params {context}
 * _app.js is a custom component and not a NextJS Page
 * Hence the params here are
 *  For Components: context === {Component, ctx: {req, res}, ...}
 *  For Pages: context === {req, res, ...}
 */
AppComponent.getInitialProps = async (appContext) => {
  const childContext = appContext.ctx;
  const { data } = await axiosProxy(childContext).get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(childContext);
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
