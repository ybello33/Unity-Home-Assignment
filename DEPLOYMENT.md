# Deployment Guide

## Prerequisites

1. **Kubernetes Cluster**: minikube, kind, or cloud provider (GKE, EKS, AKS)
2. **kubectl**: Configured to access your cluster
3. **Docker**: For building images locally (optional if using CI/CD)

## Quick Deployment

### Option 1: Using the Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Deployment

#### 1. Deploy Infrastructure

```bash
kubectl apply -k k8s/infrastructure/
```

Wait for infrastructure to be ready:
```bash
kubectl wait --for=condition=available --timeout=300s deployment/mongodb
kubectl wait --for=condition=available --timeout=300s deployment/kafka
```

#### 2. Deploy Services

```bash
kubectl apply -k k8s/services/
```

#### 3. Verify Deployment

```bash
# Check pods
kubectl get pods -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check services
kubectl get services -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check HPA
kubectl get hpa -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07
```

## Building Docker Images

### Local Build

```bash
# Build Customer Management API
docker build -t customer-management-api:latest ./services/customer-management-api

# Build Customer Facing Server
docker build -t customer-facing-server:latest ./services/customer-facing-server

# Build Frontend
docker build -t frontend:latest ./frontend
```

### Using Docker Hub

```bash
# Tag images
docker tag customer-management-api:latest <your-username>/customer-management-api:latest
docker tag customer-facing-server:latest <your-username>/customer-facing-server:latest
docker tag frontend:latest <your-username>/frontend:latest

# Push images
docker push <your-username>/customer-management-api:latest
docker push <your-username>/customer-facing-server:latest
docker push <your-username>/frontend:latest
```

Then update the image names in the Kubernetes deployment files.

## Accessing the Application

### Frontend

```bash
# Port forward
kubectl port-forward svc/frontend-service 3000:80

# Open browser
open http://localhost:3000
```

### API Endpoints

```bash
# Customer Facing Server
kubectl port-forward svc/customer-facing-server-service 3000:3000

# Customer Management API
kubectl port-forward svc/customer-management-api-service 3001:3001
```

## Monitoring

### View Logs

```bash
# Customer Management API
kubectl logs -l app=customer-management-api -f

# Customer Facing Server
kubectl logs -l app=customer-facing-server -f

# Frontend
kubectl logs -l app=frontend -f
```

### Check HPA Status

```bash
kubectl get hpa
kubectl describe hpa customer-management-api-hpa
kubectl describe hpa customer-facing-server-hpa
```

### Check Resource Usage

```bash
kubectl top pods -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Describe pod for details
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Services Not Connecting

```bash
# Check service endpoints
kubectl get endpoints

# Test connectivity from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
```

### MongoDB Connection Issues

```bash
# Check MongoDB pod
kubectl get pods -l app=mongodb

# Check MongoDB logs
kubectl logs -l app=mongodb

# Connect to MongoDB
kubectl exec -it <mongodb-pod-name> -- mongosh
```

### Kafka Connection Issues

```bash
# Check Kafka pod
kubectl get pods -l app=kafka

# Check Kafka logs
kubectl logs -l app=kafka

# List topics (if Kafka tools available)
kubectl exec -it <kafka-pod-name> -- kafka-topics.sh --list --bootstrap-server localhost:9092
```

## Cleanup

To remove all resources:

```bash
# Delete services
kubectl delete -k k8s/services/

# Delete infrastructure
kubectl delete -k k8s/infrastructure/

# Verify deletion
kubectl get all -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07
```

## Assignment UUID

All Kubernetes resources are labeled with: `e271b052-9200-4502-b491-62f1649c07`

