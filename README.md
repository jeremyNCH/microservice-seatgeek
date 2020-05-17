# microservice-seatgeek

## Setup in Google Cloud - Development in the cloud (DitC)

1. Create a new GCP account at <cloud.google.com/free> to get a free \$300 credit
2. Create a new project and a new cluster in `kubernetes engine` with `static version: 1.15.*`, `3 nodes`
3. in `Nodes`, select series `N1` and machine type `g1-small`, click `create`
4. Install Google Cloud SDK at <https://cloud.google.com/sdk/docs/quickstarts>
5. `gcloud auth login`
6. `gloud init`
7. `gloud container clusters get-credentials <project-name-in-GCP>`
8. In Docker-desktop, check if the `cluster` was added to the `kubernetes context`
9. Install ingress-nginx on GCP, <https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke> and GCP will create a `load balancer` automatically
10. In dev console, network services, load balancing, get the `IP` of the load balancer and add it to `/etc/hosts` on local as `<IP> tickets.dev`
11. `skaffold dev`
12. Create and apply secrets: `k create secret generic jwt-secret --from-literal=JWT_KEY=ChangeThisSecretValue`
13. visit `https://tickets.dev`

## Setup on local

- Install skaffold dev
- Install ingress-nginx <https://kubernetes.github.io/ingress-nginx/deploy/>
- Get docker and k8s running

```

brew update
brew install skaffold
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-0.32.0/deploy/static/provider/cloud/deploy.yaml
skaffold dev
k create secret generic jwt-secret --from-literal=JWT_KEY=ChangeThisSecretValue

```

## Note

- This repo contains an e-commerce microservice platform built using a `Reactive / event-driven` approach. Transactions are made using `Stripe.js`
- During dev on localhost, if chrome responds with a `privacy security warning`, type `thisisunsafe`. This page is thrown by the nginx engine used in this app because it might not be using `https` or it is using `self-signed certs`.
- The private mongodb instances for every service will be created by k8s depl on `skaffold dev`
- Password hashing with `scrypt` instead of `bscrypt`: https://stackoverflow.com/questions/1226513/whats-the-advantage-of-scrypt-over-bcrypt
  - scrypt requires increasingly more ram and computational power
  - scrypt is also a derivative of PBKDF2 inside the `crypto` native module in nodeJS, making module auditing easier
  - bcrypt (and PBKDF2) use constant, and small, amounts of memory.
  - scrypt require 4000x more resources to run than bcrypt

### Cutting some corners - Future Auth+Authz enhancement

- In this project, authentication is done using a JWT that is passed around in the services.
- Currently, each service can verify the validity of a JWT but cannot determine whether someone has the required `Authorization level`
- Ideally, we should handle both Auth and Authz -> this will be done in the future
  - Add `expiration` to JWT
  - If JWT is expired, refresh by calling Auth service
  - To fix authorization issue where some users might have their access removed but still have a valid JWT:
    - Add `UserBanned` event to `EVENT_BUS` and broadcast it to all services
    - All services will have a `cache` ideally using `redis` that will persist the `Banned User` for a duration of the `expiration` time of the JWT

### Server side rendering issues with NextJs

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

### Cookies VS JWT

```
          Cookies                                     |         JWT
    Transport mechanism                               | Auth + Authz mechanism
  Moves any kind  of data from browser and server     | Stores any data we want
  Auto managed by browser                             | Managed manually by devs
```

### How to create a secret for our JWT signing key

- Create the secret k8s object inside our cluster. It will be available in our pods as ENV_VARIABLE inside the container running the specific service
- `kubectl create secret generic <secret-name> --from-literal=<key>=<value>`
  - e.g: `k create secret generic jwt-secret --from-literal=JWT_KEY=ChangeThisSecretValue`
  - `k get secrets` to get all secrets

## Responses

- `error-handler` middleware takes in the error, formats them and sends them back. Any error specific logic is handled by the specific error superset in `/src/errors`

### Error response format

- 400 Bad Request

> Interface

```

{
  errors: {
    message: string,
    field?: string
  }[]
}

```

> Example

```

{
  "errors": [
    {
      "message": "Email must be valid",
      "field": "email"
    },
    {
      "message": "Password must be between 4 and 30 characters",
      "field": "password"
    }
  ]
}

```

## K8S namespaces

- All services are created under the `default` namespace
- To do inter-services communication inside the same cluster, we use ClusterIP
- To do Cross-namespace communication, we need to reach the ingress-nginx load balancer first, then use its route rules to reach the desired service

  > k get namespace, returns ingress-nginx

  > k get services -n <name-of-namespace>, eg: k get services -n ingress-nginx, returns ingress-nginx-controller

  > http://<NameOfLoadBalancerService>.<Namespace>.svc.cluster.local/<endpoint>

  > http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/user/currentuser

## npm packages - how to build and publish the common library

- Create an npm account and a public organisation
- https://docs.npmjs.com/cli/version
- https://www.npmjs.com/package/@jnch-microservice-tickets/common

```
  npm login
  npm run build
  git add .
  git commit -m <message>
  npm version patch/minor/major
  git push
  npm publish --access public
```

- To update common module in other services
  > npm update @jnch-microservice-tickets/common
