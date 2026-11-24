# Postmortem: Dégradation du service myapp suite au déploiement de la révision 2

## Summary and impact
Le 24/11/2026 entre 18:05:54 et 18:14:02 UTC (durée : environ 8 minutes), le service `myapp` dans le namespace `dev` a subi un taux d'erreurs HTTP 5xx supérieur à 10 % à la suite du déploiement d'une nouvelle image défaillante. Les utilisateurs recevaient des erreurs serveur sur les endpoints principaux. Le service a été rétabli par un rollback Kubernetes.

## Timeline (UTC)
- **18:05:54 UTC** — Déploiement de la nouvelle image défaillante dans le namespace `dev`.
- **18:06:49 UTC** — Hausse anormale du taux d'erreurs 5xx visible sur le dashboard Grafana (panneau Errors).
- **18:07:02 UTC** — Confirmation de la dégradation sur les métriques du dashboard Grafana.
- **18:07:34 UTC** — Persistance du taux d'erreurs au-dessus du seuil de 10 % détectée par Prometheus.
- **18:08:04 UTC** — Passage de l'alerte Prometheus `HighErrorRate` à l'état `PENDING`.
- **18:08:37 UTC** — Passage de l'alerte `HighErrorRate` à l'état `FIRING` ; prise en charge par le responder, consultation de `kubectl rollout history` et `kubectl logs` et corrélation établie avec le dernier déploiement.
- **18:11:46 UTC** — Exécution du rollback (`kubectl rollout undo deployment/myapp -n dev`).
- **18:14:23 UTC** — Retour à la normale confirmé sur Grafana (taux d'erreurs revenu à la baseline) et extinction de l'alerte `HighErrorRate`.

## Root cause and contributing factors
- **Cause racine :** L'image déployée contenait une régression provoquant des erreurs HTTP 500.
- **Facteurs contributifs :**
  - Absence de tests automatisés (smoke tests) validant les endpoints après déploiement.
  - Stratégie de déploiement exposant immédiatement 100 % du trafic à la nouvelle version sans vérification progressive.

## What went well / what went poorly
### What went well
- L'alerte `HighErrorRate` et le dashboard des golden signals ont permis de détecter rapidement l'anomalie.
- Le runbook et la commande `kubectl rollout undo` ont permis une mitigation rapide en quelques secondes.
- Les logs structurés JSON ont facilité la confirmation des erreurs `5xx`.

### What went poorly
- La version défaillante a pu être déployée sans être bloquée par la CI/CD.
- Le délai de détection dépendait
