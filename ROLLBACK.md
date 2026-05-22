# Rollback Procedure

## Overview
OKD Kubernetes supports automatic and manual rollbacks for deployments.

## Automatic Rollback
OKD automatically rolls back failed deployments because we use `RollingUpdate` strategy:
- If health checks fail, the old pod stays running
- New pods are terminated
- Service traffic continues on old version
- No manual intervention needed

## Manual Rollback

### View Rollout History
```bash
kubectl rollout history deployment/en3f -n itip-en-03
```

### Rollback to Previous Version
```bash
kubectl rollout undo deployment/en3f -n itip-en-03
```

### Rollback to Specific Revision
```bash
kubectl rollout undo deployment/en3f -n itip-en-03 --to-revision=2
```

## Via OKD Dashboard (Easiest)

1. Go to **Workloads → Deployments → ef3b**
2. Click **Rollout History** tab
3. Click on a previous revision
4. Click **Rollback** button
5. Confirm rollback
6. Watch the pod restart with old image

## Example Incident Response

**Scenario:** Production deployment breaks the login API

**Steps:**
1. **Detect:** Uptime Kuma alerts that backend is down
2. **Rollback:** Run `kubectl rollout undo deployment/en3b -n itip-en-03`
3. **Verify:** Check health checks pass and service is up
4. **Communicate:** Notify team of incident
5. **Fix:** Merge fix to main branch
6. **Redeploy:** New image auto-deploys via CD pipeline

## Rollback Status
```bash
kubectl rollout status deployment/en3f -n itip-en-03
```

## Undo Rollback (Go forward again)
```bash
kubectl rollout redo deployment/en3f -n itip-en-03
```
