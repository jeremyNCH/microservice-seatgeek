import 'bootstrap/dist/css/bootstrap.css';
import Head from 'next/head';
import axiosProxy from '../api/axios-proxy';
import Header from '../components/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Head>
        <link rel="icon" href="favicon.ico" />
      </Head>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
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
  const axiosClient = axiosProxy(childContext);
  const { data } = await axiosClient.get('/api/users/currentuser');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    /**
     * Pass down axios client to avoid rebuilding a new client for every request
     * pass down currentUser to AppComponent and hence to every other children/pages since AppComponent is the root component
     */
    pageProps = await appContext.Component.getInitialProps(
      childContext,
      axiosClient,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data
  };
};

export default AppComponent;
