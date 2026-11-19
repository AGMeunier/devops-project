# devops-project

# Lab1

## Question 1 - Why forbid direct pushes to main?
We forbid direct pushes to main to keet the main branch clean at all time, and have each different features on its own branch.

## Question 2 - What is the difference between an image and a container ?
An image is a file containing all the informations necessary for building a container, while a container is the virtual environment in which an application will run.

## Question 3 - Compare the size of your image with a non-slim base image. What do you observe?
We notice that the non-slim base image is much heavier than our image with a 1.388GB difference in disk usage and a 365.2MB content size difference.

## Question 4 - Why tag with the commit SHA rather than latest?

This tags each image with the commit it is associated with.
Immutability: latest is overwritten at every push, so the same tag can point to different code over time.
Rollback: to go back, you redeploy a previous SHA. With latest, you can’t know what you’d get.
Deployment reliability: tools like Kubernetes may not pull a new image if the tag name hasn’t changed.

## Question 5 - What does “fail fast” mean in a pipeline?
The pipeline stops at the first failure and reports it immediately, instead of continuing with later steps. Cheap, fast checks (lint, unit tests) run before slow, expensive ones (image build, publish). This gives quicker feedback and saves CI time. It also prevents broken code from being published. Here, needs: build-test means publish never runs when tests fail, which is exactly what your screenshot showed.

# Lab2

## Question 1 - What is the role of a namespace? Does it provide strong security isolation by itself?

A namespace is a logical partition of a cluster. It scopes resource names (two apps can both be called myapp in different namespaces), and it is the unit to which you attach RBAC rules, resource quotas, limit ranges and network policies. It lets several teams or environments share one cluster in an organized way.
It does not provide strong security isolation by itself. By default, pods in different namespaces can still talk to each other over the network.

## Question 2 - Why does Kubernetes recreate the deleted pod? Which component is responsible?

Kubernetes recreates the deleted pod because we specified in the deployment.yaml file that we wanted 3 replicas

## Question 3 - What is the difference between a readiness and a liveness probe? What happens to traffic when readiness fails?
The readiness probe decides whether a pod receives traffic. The liveness probe decides whether the container is healthy or must be restarted. When readiness fails, the pod stays running but is removed from the Service’s endpoints, so no traffic goes to it. When liveness fails, the kubelet restarts the container.
 
## Question 4 - Is a Kubernetes Secret encrypted by default? How would you improve this?
No. By default a Secret is only base64-encoded, not encrypted, and anyone with read access to the Secret (or to etcd) can decode it. Improvements: enable encryption at rest for etcd, restrict access with RBAC, use an external secret manager, and never commit secrets to Git.

## Question 5:
The base defines the application once, and each overlay only describes what differs per target. 
Between a real on-prem cluster and a cloud cluster, the differences are typically:

Ingress and load balancing: cloud LoadBalancer services versus MetalLB or a hardware load balancer on-prem.
Storage: cloud storage classes versus local or NFS/Ceph storage.
Identity and secrets: cloud IAM and KMS versus Vault or an internal PKI.
Registry access and network: private registries, proxies, firewalls, egress rules.
Scaling and node pools: autoscaling nodes in the cloud, fixed capacity on-prem.

## Question 6: 
A Deployment’s rolling update strategy replaces pods gradually, controlled by maxSurge and maxUnavailable (25% each by default). New pods are created first, and an old pod is only removed once a new pod becomes Ready. The broken image never became Ready (it could not even be pulled), so the rollout stalled and the old ReplicaSet kept its healthy pods and kept serving traffic. This is also why the readiness probe from Part 3 matters: a pod that fails it never receives traffic.

## Question 7:
Start from the running pod and read its image tag (kubectl describe pod), which is the commit SHA. Then read the Deployment’s annotations (commit, pipeline run URL, ticket). With the SHA you find the commit in Git, the pull request that contains it and its reviewer. The pipeline run URL leads to the CI logs and the publish job. The API audit log (bonus) adds who ran the apply and when.
## Question 8:
kubectl edit changes the live cluster directly, skipping Git, code review and CI. The cluster no longer matches the repository , nothing records why the change was made, and the annotations may become false. The audit log shows only who edited it, not the reason. The next kubectl apply or a GitOps sync will silently overwrite the edit, which can reintroduce an incident. The fix is to change production only through Git and the pipeline, and to restrict edit rights with RBAC.


# LAB3

## Question 1:

After we manually delete a container, Terraform lets us recreate the missing resource so we can restore the declared state. This situation is called a drift.

## Question 2:

We should never commit the state file to Git because it can contain identifiers, secrets, internal adresses and computated values and can also be shared with conccurent modifications which would overwrite the project's state.

## Question 3:

The advantages of one folder and one state per environment compared to workspace is that the former gives us configurations and variable clearly separated, which, in turn, reduces the risks of accidental modifications of an other environment, while the workpaces model makes it easier to mix everything up.

## Question 4:

A remote backend with locking is essential for a team since it centralizes and protects the state, prevents multiple users to read an old copy of it, and saves us from concurrent modifications. It reduces state loss, incoherent states, simultaneous operations and unaudited modifications.

## Question 5:

A Terraform state can contain passwords, API keys, certificates, connexion chains, IP adresses, metadata and network identifiers.

## Question 6:

If we never destroy the preview environment, we risk accumulating namespaces, pods, services, volumets, IP adresses and other costs. To mitigate it, we can: 
- automatically delete previews when closing or fusing a PR,
- use a date of expiration,
- apply quotas & limit ressources.

## Question 7:

If we run plan on a PR but apply only after merge, it is because, while the plan lets you read infrastructure modifications, make validations fail and detect all risks before merging, the apply is reserved to the main branch or at a post aproved state so we limit non approved actions.

## Question 8:

We should use an OIDC instead of long-lived access keys because the latter can become a liability when left for long as they can always leak while temporary identifiers that are limited to a pipeline or a branch are safer.