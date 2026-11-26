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

# LAB 4

### Question 1

Pourquoi est-ce un problème d'utiliser un identifiant utilisateur ou une URL complète contenant des IDs comme label de métrique ?


-Explosion de cardinalité : chaque combinaison unique de labels crée une nouvelle série temporelle dans Prometheus ; des identifiants non bornés en génèrent des milliers voire des millions.
-Saturation des ressources : cette multiplication surcharge rapidement la mémoire et le disque de Prometheus, ralentit les requêtes PromQL et risque de provoquer un crash (OOM).

### Question 2

Pourquoi logger sur `stdout` en JSON plutôt que dans un fichier en texte brut ?


-Intégration conteneur (`stdout`) : évite de remplir le stockage éphémère du pod ou de gérer la rotation de fichiers, tout en permettant à Kubernetes (`kubectl logs`) et aux collecteurs de récupérer les logs automatiquement.
-Analyse facilitée (JSON) : structure chaque log en champs directement filtrables (`timestamp`, `level`, `method`, `path`, `status`) sans dépendre d'expressions régulières fragiles sur du texte brut.

### Question 3

La cible (target) n'apparaît pas. Citez trois éléments à vérifier.


-Label de découverte du `ServiceMonitor` : vérifier qu'il porte le label attendu par l'opérateur Prometheus (`release: monitoring`).
-Namespace et labels du Service : vérifier que `namespaceSelector` inclut `dev` et que `selector.matchLabels` correspond exactement aux labels du Service (`app: myapp`).
-Port nommé et endpoint : vérifier que le port du Service est bien nommé `http` (pour correspondre au `ServiceMonitor`) et que les pods répondent sur `/metrics`.

### Question 4

Pourquoi le 95e percentile est-il plus informatif que la latence moyenne ?


-Effet de lissage de la moyenne : une moyenne masque les pics de lenteur dès lors que la majorité des requêtes reste rapide.

-Visibilité de la latence de queue : le p95 indique le temps de réponse maximal subi par 95 % des requêtes et révèle immédiatement l'expérience dégradée des 5 % les plus lentes.

### Question 5

Qu'est-ce que l'alert fatigue et comment la clause `for:` et les labels `severity` aident-ils ?

- Alert fatigue (fatigue d'alerte) : surcharge liée à trop d'alertes bruyantes ou non critiques (faux positifs), qui pousse les équipes à les ignorer ou à réagir trop tard lors d'un véritable incident.
- Clause `for:` : impose que la condition reste vraie sur une durée continue (ex. `2m`) avant de passer en `FIRING`, ce qui filtre les pics brefs et transitoires.
- Labels `severity` : hiérarchisent et routent les alertes via Alertmanager (`critical` déclenche une intervention immédiate, `warning` envoie une notification ou crée un ticket non urgent).

### Question 6

Pourquoi mitiger avant de chercher la cause racine ?

- Réduction du MTTR : la priorité absolue durant un incident est de stopper l'impact utilisateur et de rétablir le service au plus vite (par exemple via un rollback).
- Investigation à froid : chercher la cause exacte dans le code pendant une panne prolonge inutilement l'indisponibilité ; les logs et métriques capturés permettent d'analyser le problème sereinement après rétablissement.

### Question 7

Pourquoi un postmortem doit-il être blameless et comment reformuler « Alex deployed a bad version » ?

- Approche systémique : l'erreur humaine est inévitable ; c'est au système (processus, tests, garde-fous CI/CD) d'empêcher qu'elle devienne un incident.
- Culture de transparence : blâmer une personne crée un climat de peur qui pousse à cacher les erreurs au lieu de les partager pour renforcer la fiabilité.
- Reformulation : « Une image contenant une régression a été déployée dans l'environnement `dev` sans être bloquée par la pipeline de validation automatique. »

### Question 8

Deux changements concrets au pipeline des séances 1 à 3 pour prévenir ou limiter cet incident :

- Smoke tests automatisés en CI/CD : exécuter des requêtes HTTP après le déploiement pour vérifier que l'application démarre, expose `/metrics` et répond `200 OK`, en bloquant ou annulant le rollout en cas d'échec.
- Déploiement Canary (ou Blue/Green) avec rollback automatique : rediriger d'abord une faible part du trafic (ex. 10 %) vers la nouvelle version, surveiller le taux d'erreurs 5xx dans Prometheus et déclencher un rollback automatique si le seuil est dépassé.
