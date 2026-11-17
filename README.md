# devops-project

## Questions

### 1 - Why forbid direct pushes to main?
We forbid direct pushes to main to keet the main branch clean at all time, and have each different features on its own branch.

### 2 - What is the difference between an image and a container ?
An image is a file containing all the informations necessary for building a container, while a container is the virtual environment in which an application will run.

### 3 - Compare the size of your image with a non-slim base image. What do you observe?
We notice that the non-slim base image is much heavier than our image with a 1.388GB difference in disk usage and a 365.2MB content size difference.

### Q4. Why tag with the commit SHA rather than latest?

This tags each image with the commit it is associated with.
Immutability: latest is overwritten at every push, so the same tag can point to different code over time.
Rollback: to go back, you redeploy a previous SHA. With latest, you can’t know what you’d get.
Deployment reliability: tools like Kubernetes may not pull a new image if the tag name hasn’t changed.

### Q5. What does “fail fast” mean in a pipeline?
The pipeline stops at the first failure and reports it immediately, instead of continuing with later steps. Cheap, fast checks (lint, unit tests) run before slow, expensive ones (image build, publish). This gives quicker feedback and saves CI time. It also prevents broken code from being published. Here, needs: build-test means publish never runs when tests fail, which is exactly what your screenshot showed.

#### Lab
### Q1.What is the role of a namespace? Does it provide strong security isolation by itself?

A namespace is a logical partition of a cluster. It scopes resource names (two apps can both be called myapp in different namespaces), and it is the unit to which you attach RBAC rules, resource quotas, limit ranges and network policies. It lets several teams or environments share one cluster in an organized way.
It does not provide strong security isolation by itself. By default, pods in different namespaces can still talk to each other over the network, 