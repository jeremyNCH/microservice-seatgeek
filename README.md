# microservice-seatgeek

## Setup in Google Cloud (DEV ONLY) - Development in the cloud (DitC)

1. Create a new GCP account at <cloud.google.com/free> to get a free \$300 credit
2. Create a new project and a new cluster in `kubernetes engine` with `static version: 1.15.*`, `3 nodes`
3. in `Nodes`, select series `N1` and machine type `g1-small`, click `create`
4. Install Google Cloud SDK at <https://cloud.google.com/sdk/docs/quickstarts>
5. `gcloud auth login`
6. `gloud init`
7. `gloud container clusters get-credentials <project-name-in-GCP>`
8. In Docker-desktop, check if the `cluster` was added to the `kubernetes context`. Kuberbetes must be pointed to GCP k8s cluster
9. Install ingress-nginx on GCP, <https://kubernetes.github.io/ingress-nginx/deploy/#gce-gke> and GCP will create a `load balancer` automatically
10. In dev console, network services, load balancing, get the `IP` of the load balancer and add it to `/etc/hosts` on local as `<IP> buytickets.dev`
11. `skaffold dev`
12. Create a stripe account and an API key and add the secret to k8s secrets. <https://stripe.com/docs/payments>, <https://stripe.com/docs/api>
13. Create and apply secrets:

- k create secret generic jwt-secret --from-literal JWT_KEY=ChangeThisSecretValue
- k create secret generic stripe-secret --from-literal STRIPE_KEY=stripe_secret_key_value

14. visit `https://buytickets.dev`

## Setup on local

- Install skaffold dev
- Install ingress-nginx <https://kubernetes.github.io/ingress-nginx/deploy/>
- Get docker and k8s running
- To restart ts-node-dev server, enter `rs` in the terminal window

```

brew update
brew install skaffold
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-0.32.0/deploy/static/provider/cloud/deploy.yaml
skaffold dev
k create secret generic jwt-secret --from-literal=JWT_KEY=ChangeThisSecretValue

```

## Flow

1. Signup and a JWT stored in a cookie will be returned in 1 go with Next.js
2. Create a ticket with a title and a price => emit `ticket:created`
3. Edit the ticket => emit `ticket:updated`
4. Create a order for a ticket => emit `order:created`
5. Ticket link with order will be locked/reserved for x mins so that no further editing can be done
6. After x mins, expiraion service expires the order and the ticket is unlocked
7. Expired order => emits `order:cancelled`
8. NEED TO COMPLETE THIS FLOW

## Cutting some corners - FEATURES NOT YET IMPLEMENTED IN THIS REPO

### 1. Future Auth+Authz enhancement

- In this project, authentication is done using a JWT that is passed around in the services.
- Currently, each service can verify the validity of a JWT but cannot determine whether someone has the required `Authorization level`
- Ideally, we should handle both Auth and Authz -> this will be done in the future
  - Add `expiration` to JWT
  - If JWT is expired, refresh by calling Auth service
  - To fix authorization issue where some users might have their access removed but still have a valid JWT:
    - Add `UserBanned` event to `EVENT_BUS` and broadcast it to all services
    - All services will have a `cache` ideally using `redis` that will persist the `Banned User` for a duration of the `expiration` time of the JWT

### 2. Event failure and transaction rollback

- After a service persist data into its own database, it will usually publish an event like `ticket:created` to notify other services
- However, if the event fails to go through event with retries, like `NATS-streaming-server` going down permanently, other state of other services will not be updated
- **SOLUTION:**
  - Implement a `transaction` feature similar to a `database transaction` whereby if anything fails during the series of actions in the transaction, it is marked as `failed` and all previous state changes are `rolled back`.
  - `Service A` stores both its data and the events it wants to publish in 2 separate collection
  - An external listener is setup which get triggered when a new update is made to the `events collection` of service A
  - The external listener then publishes the new event to NATS which publish them to any service listening to that topic
  - The event is marked as `success/failed` by the external listener
  - If `failed`, the whole `transaction rolls back`
- **Example: a user deposits \$X to his account**
  - The records of his action is updated by the records service which then publish and event to update the account balance state/service
  - NATS connection lost and event never goes through
  - even though the record says the deposit got through, the user never sees an update to his account balance => **BAD**

### 3. Add HTTPS support

- See <https://cert-manager.io/docs/tutorials/acme/ingress/>

### 4. Add Email Service to notify users

- Send email to notify users on payment:complete
- See Mailchimp/Sendgrid

### 5. Add `build` steps for prod cluster

- Currently, the services are running in `dev` mode with `ts-node-dev`
- Create additional Dockerfiles and npm commands to start service in `prod` mode

### 6. Add a Staging environment

- Create a staging cluster on Digital Ocean
- Add CICD pipelines from github to the Staging cluster

## Note

- This repo contains an e-commerce microservice platform built using a `Reactive / event-driven` approach. Transactions are made using `Stripe.js`
- During dev on localhost, if chrome responds with a `privacy security warning`, type `thisisunsafe`. This page is thrown by the nginx engine used in this app because it might not be using `https` or it is using `self-signed certs`.
- The private mongodb instances for every service will be created by k8s depl on `skaffold dev`
- Password hashing with `scrypt` instead of `bscrypt`: https://stackoverflow.com/questions/1226513/whats-the-advantage-of-scrypt-over-bcrypt
  - scrypt requires increasingly more ram and computational power
  - scrypt is also a derivative of PBKDF2 inside the `crypto` native module in nodeJS, making module auditing easier
  - bcrypt (and PBKDF2) use constant, and small, amounts of memory.
  - scrypt require 4000x more resources to run than bcrypt

### Server side rendering issues with NextJs

- Usually, a regular react app has 3 stages:

  1. Initial request to `buytickets.dev`: fetch boilerplate html
  2. 2nd request: fetch react scripts with rendering logic
  3. 3rd request: Auth + fetch data from resource API

- NextJS will try to build the full html page with all the content and send it back with only a `single` initial request
  - Client request `buytickets.dev`
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

### Concurrency issues with :updated events - Solution: Record Updates with Optimistic Concurrency Control

- After the ticket and order services have been created and can now CRUD and persist their own and redundant data by emitting events, we observed concurrency issues where events are not always processed in order
- Scenario: 4 instance of tickets and orders each, 200 requests doing the following:
  - Create a ticket with price = 5
  - Update the ticket to price = 10
  - Update the ticket to price = 15
- Expect: all tickets in the tickets db and the orders db have price = 15
- Result: Some tickets have price = 10
- **Solution:**
  - Add a version flag to the tickets and use it to process events in order. If out of order, do NOT `msg.ack()` and let the event timeout. NATS will then retry to publish that event 5s later in the hope that the missing version has been processed
  - The version flag `__v` from mongoose and mongoDB and be used to that end
  - Lookup: `Record Updates with Optimistic Concurrency Control`
  - Use npm package: `mongoose-update-if-current`: <https://www.npmjs.com/package/mongoose-update-if-current>
    - This package can implement Optimistic concurrency control with `version number` or `timestamps`
  - In listener, query resource with both `_id` and `version` flag
    - If not found, we are processing ticket out of order
    - Reject event OR allow to timeout so that NATS can requeue and retry to send this event

## Services overview

### Auth

- On signup, Auth will create a JWT with no expiration and return it in a cookie
- Has signin and signout logic
- Need to add JWT expiration and other features from Cutting some corners - FEATURES NOT YET IMPLEMENTED IN THIS REPO

### Ticket

- CRUD tickets
- Events:
  - `ticket:created`
  - `ticket:updated`
- Has its own db to store all tickets

### Order

- CRUD orders
- Events:
  - `order:created`
  - `order:cancelled`
- Associates and locks a ticket with an order with an `orderId`
- Locks the order for 15mins to allow for payment and waits for expiration service to free up the ticket once the order is expired
- Once a ticket is lock, it cannot be edited and can only be purchased or expired/cancelled

### Expiration

- Expires orders
- Has a webserver to listen to `order:created` and emit `expiration:complete`
- `order:created` event payload already has a `expiresAt` property that the exp service watches and emits on expiration
- Expiration service has no logic to process order expiration -> only emits event, it is the order service that listens to `expiration:complete` and has expiration-specific logic
- Uses `Bull.js` to create and manage job queues
- Jobs are stored in `redis`
- Jobs are separately processed on a worker server

### Payment

- Uses `Stripe.js`
  - Backend: <https://www.npmjs.com/package/stripe>
  - Frontend: <https://www.npmjs.com/package/react-stripe-checkout>
- To test stripe:
  - Test Token: `tok_visa`,
  - VISA card: `4242424242424242`
- More on <https://stripe.com/docs/testing>

### Nats Event Broker

- Event broker using NATS-streaming-server
- Makes use of queue group name to avoid duplicate event processing
- Has event sourcing and redelivery for reliability and to allow new/restarted services to sync up their states

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

## EVENT BUS with NATS streaming server

- <https://docs.nats.io/nats-streaming-server/changes>
- <https://hub.docker.com/_/nats-streaming>

- This repo uses the `nats-pod-name` as the nats `client-id` in `nats.connect(clusterId, clientId, { nats-cluster-ip });` as described in `ticket-depl.yaml` and `/ticket/index.ts`

### Setup

#### Local

```
  npm i
  npm run publish
  npm run listen
```

### Port Forwarding to make the pod accessible during dev in local/GCP K8S

```
  kubectl get pods
  kubectl port-forward <nats-pod-name> 4222:4222
  kubectl port-forward <nats-pod-name> 8222:8222
```

To access the monitoring page

> goto localhost:8222/streaming

### NATS server health check

- In `nats-depl.yaml` k8s deployment file, we have 3 `hb: heartbeat` arguments in `arg` of
  - `-hbi`: How often NATS will make a health request to each of its client
  - `-hbt`: How long each client has to respond
  - `-hbf`: How many times each client can fail until NATS assume they are down/unhealthy

## Deployment and automation

### Github repo approach

- Mono Repo Approach
- Automate workflow, test and build using `Github Actions` <https://help.github.com/en/actions/reference/events-that-trigger-workflows>
  - On PR create/commits, run tests inside respective repo with new changes
- Check `.github/workflows/tests-*.yml`

### Full deployment on Digital Ocean => Cheaper at $40/month => Google search $100 credit coupon on new account

- Look for a coupon and create a new Digital Ocean account
- Create a cluster with \$10/months, 3 nodes-cluster
- Install `doctl` at <https://github.com/digitalocean/doctl>
  > `brew install doctl`
- Go to Digital Ocean => API => Generate new token
  > `doctl auth init`
- Enter the token
- Go to Digital Ocean => Kubernetes => `<Your_Cluster_Name>`
- Add the K8S context to your local `kubectl`
  > `doctl kubernetes cluster kubeconfig save <Your_Cluster_Name>`
- List all K8S context
  > `kubectl config view`
- Use a different context OR if on Mac, use the docker-desktop client => kubernetes => choose the context
  > `kubectl config use-context <Context_Name>`
- Create github actions for continuous deployment of our services on `PR merge` to `master`
  - Action Flow on `master` branch change:
    - Services: Build new image => Push to docker hub => update deployment
    - Infra: Apply all yaml files to our cluster on Digital Ocean
  - Before creating the new workflows, Create a Github secret inside github to allow dockerhub to login
    - Github repo => settings => secrets => add secret
- Add `Digital Ocean API key` and `Cluster Name` as secret in github
- Add `doctl` to github container and point `kubectl` inside github to Digital Ocean => see `./github/workflows/deploy-*.yml`
- Create `JWT_KEY` and `STRIPE_KEY` secrets inside Digital Ocean
- Setup Ingress-Nginx inside Digital Ocean <https://kubernetes.github.io/ingress-nginx/deploy/#digital-ocean>
