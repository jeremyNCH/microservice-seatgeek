import 'bootstrap/dist/css/bootstrap.css';

/**
 * Whenever we navigate to a page, next imports the component and wraps it in its own default <app /> component before rendering it
 * _app.js overrides nextjs's default <app /> component
 * we do this so that we can use globals such as the bootstrap.css library
 * https://github.com/zeit/next.js/blob/master/errors/css-global.md
 */
export default ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};
