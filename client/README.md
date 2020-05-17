# microservice-seatgeek-client

The client is built using Next.js, a React Server-Side Rendering engine

## Setup

```
  npm i
  npm run dev
```

> Go to `tickets.dev`

If you are on GCP, a simple `skaffold dev` is enough, else if you are running on `local`,

```
  docker build -t <dockerhubId>/client .
  docker push <image-name>
```

> Go to localhost:3000

## Notes

### How to include globals such as third party packages and libraries

- <https://github.com/zeit/next.js/blob/master/errors/css-global.md>
- Whenever we navigate to a page, next imports the component and wraps it in its own default `<app />` component before rendering it
- \_app.js overrides nextjs's default `<app />` component we do this so that we can use globals such as the bootstrap.css library

### Server side rendering issues with Auth using NextJs with a microservice architecture

- Usually, a regular react app has 3 stages:

  1. Initial request to `tickets.dev`: fetch boilerplate html
  2. 2nd request: fetch react scripts with rendering logic
  3. 3rd request: Auth + fetch data from resource API

- NextJS will try to build the full html page with all the content and send it back with only a `single` initial request
  - Client request `tickets.dev`
  - NextJS makes call to API to get data, builds the `fully` rendered html with content and returns it
- Calling the API resources needs Auth+Authz with JWT, but we cannot attach any headers or body content with the initial request to auth the user in
  - `Solution`: Attach `JWT` to a `cookie` in the initial request with npm module `cookie-session`
  - Corner case solution: Use `service-workers` -> Requires major architectural change
- Advantage of SSR:
  - SEO: Search Engine Optimization
  - Faster page load speed: better UX on older or mobile devices with low processing power

### GOTCHA

- getInitialProps: make fetch data calls here to get data to build the full HTML page during an SSR cycle.
  - requests are made from the NextJS server and not the browser
- `_app.js` will override the default `<App />` wrapper that NextJS uses

- NextJS component tree

```
        <_App />
          |
      <Other child components>
```

- If `getInitialProps` is defined in `_app.js`, other child `getInitialProps` will NOT be called automatically
  - You will need to call them manually from `_app.js` and propagate the data down the tree to the respective components via `props`
