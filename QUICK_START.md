# Quick Start Guide

## Assignment UUID
**e271b052-9200-4502-b491-62f1649c07**

## Prerequisites Check

```bash
# Check kubectl
kubectl version --client

# Check Docker
docker --version

# Check Node.js (for local development)
node --version
```

## Deployment Steps

### 1. Build Docker Images

```bash
cd /Users/user/Downloads/devops-assignment

docker build -t customer-management-api:latest ./services/customer-management-api
docker build -t customer-facing-server:latest ./services/customer-facing-server
docker build -t frontend:latest ./frontend
```

### 2. Deploy to Kubernetes

```bash
# Option A: Use deployment script
./deploy.sh

# Option B: Manual deployment
kubectl apply -k k8s/infrastructure/
kubectl apply -k k8s/services/
```

### 3. Access the Application

```bash
# Port forward frontend
kubectl port-forward svc/frontend-service 3000:80

# Open browser
open http://localhost:3000
```

## Testing the Application

1. **Fill in the form**:
   - Username: `testuser`
   - User ID: `user123`
   - Price: `99.99`

2. **Click "Buy"** button
   - Should show success message
   - Purchase is published to Kafka
   - Customer Management API consumes and stores in MongoDB

3. **Click "getAllUserBuys"** button
   - Should display all purchases for the user
   - Data retrieved from MongoDB via Customer Management API

## Verify Deployment

```bash
# Check all pods
kubectl get pods -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check services
kubectl get services -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check HPA
kubectl get hpa -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check logs
kubectl logs -l app=customer-management-api -f
kubectl logs -l app=customer-facing-server -f
```

## Troubleshooting

### Pods not starting?
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Services not connecting?
```bash
kubectl get endpoints
kubectl get services
```

### MongoDB issues?
```bash
kubectl logs -l app=mongodb
kubectl exec -it <mongodb-pod> -- mongosh
```

### Kafka issues?
```bash
kubectl logs -l app=kafka
```

## Cleanup

```bash
kubectl delete -k k8s/services/
kubectl delete -k k8s/infrastructure/
```

## Project Structure

```
devops-assignment/
├── services/
│   ├── customer-management-api/    # API service
│   └── customer-facing-server/      # Web server
├── frontend/                        # React app
├── k8s/                            # Kubernetes manifests
│   ├── infrastructure/             # MongoDB, Kafka
│   └── services/                   # Application services
├── .github/workflows/              # CI/CD pipeline
├── README.md                       # Main documentation
├── DEPLOYMENT.md                   # Deployment guide
├── SOLUTION.md                     # Solution documentation
└── deploy.sh                       # Deployment script
```

## Key Files

- **README.md**: Complete documentation
- **DEPLOYMENT.md**: Detailed deployment instructions
- **SOLUTION.md**: Architecture and design decisions
- **deploy.sh**: Automated deployment script

## Support

For detailed information, see:
- `README.md` - Main documentation
- `DEPLOYMENT.md` - Deployment guide
- `SOLUTION.md` - Architecture details

