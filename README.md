# microservice-seatgeek

## Note

- During dev on localhost, if chrome responds with a `privacy security warning`, type `thisisunsafe`. This page is thrown by the nginx engine used in this app because it might not be using `https` or it is using `self-signed certs`.

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
12. visit `tickets.dev`

## Setup on local

- Install skaffold dev
- Install ingress-nginx <https://kubernetes.github.io/ingress-nginx/deploy/>
- Get docker and k8s running

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-0.32.0/deploy/static/provider/cloud/deploy.yaml
skaffold dev
```
