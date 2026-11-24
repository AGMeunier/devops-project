# Runbook : HighErrorRate

## Symptômes
- L'alerte Prometheus `HighErrorRate` (sévérité `critical`) est à l'état `FIRING`.
- Plus de 10 % des requêtes HTTP retournent un code `5xx` pendant au moins 2 minutes consécutives.
- Le panneau **Errors** du dashboard Grafana montre un pic d'erreurs serveur.

## Vérifications rapides (Quick Checks)
1. Vérifier l'état des pods dans le namespace `dev` :
   ```bash
   kubectl get pods -n dev
