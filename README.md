# DevOps Engineer Home Assignment

## Overview

This is a production-ready microservices-based e-commerce purchase system implementing a complete DevOps solution with:

- **Customer Management API**: Manages customer purchases, consumes Kafka messages, stores data in MongoDB
- **Customer Facing Web Server**: Handles purchase requests, publishes to Kafka, retrieves purchase history
- **Frontend UI**: React-based user interface for purchasing and viewing purchase history
- **Kubernetes Deployment**: Complete K8s manifests with autoscaling
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing, building, and deployment

## Architecture

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   Frontend  │────────▶│ Customer Facing      │────────▶│    Kafka    │
│   (React)   │         │ Web Server           │         │             │
└─────────────┘         └──────────────────────┘         └──────┬──────┘
                                                                │
                                                                ▼
┌──────────────────────┐         ┌──────────────────────┐    ┌─────────────┐
│ Customer Management  │◀────────│   MongoDB           │    │  Consumer  │
│ API                  │         │                      │    │  (Kafka)   │
└──────────────────────┘         └──────────────────────┘    └─────────────┘
```

## Prerequisites

- **Kubernetes Cluster** (minikube, kind, or cloud provider)
- **kubectl** configured to access your cluster
- **Docker** for building images
- **Node.js 18+** and npm for local development
- **MongoDB** (deployed in K8s or external)
- **Kafka** (deployed in K8s or external)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devops-assignment
```

### 2. Build Docker Images

```bash
# Build all images
docker build -t customer-management-api:latest ./services/customer-management-api
docker build -t customer-facing-server:latest ./services/customer-facing-server
docker build -t frontend:latest ./frontend
```

### 3. Deploy Infrastructure (MongoDB & Kafka)

```bash
# Deploy MongoDB
kubectl apply -f k8s/infrastructure/mongodb/

# Deploy Kafka (using Strimzi operator or Bitnami)
kubectl apply -f k8s/infrastructure/kafka/
```

### 4. Deploy Application Services

```bash
# Deploy all services
kubectl apply -f k8s/services/

# Or deploy individually:
kubectl apply -f k8s/services/customer-management-api/
kubectl apply -f k8s/services/customer-facing-server/
kubectl apply -f k8s/services/frontend/
```

### 5. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check services
kubectl get svc -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check HPA
kubectl get hpa -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07
```

### 6. Access the Application

```bash
# Get frontend service URL
kubectl port-forward svc/frontend-service 3000:80

# Open browser to http://localhost:3000
```

## Project Structure

```
devops-assignment/
├── services/
│   ├── customer-management-api/    # Customer Management API service
│   └── customer-facing-server/      # Customer Facing Web Server
├── frontend/                        # React frontend application
├── k8s/                            # Kubernetes manifests
│   ├── infrastructure/             # MongoDB, Kafka
│   └── services/                   # Application services
├── .github/
│   └── workflows/                  # CI/CD pipelines
└── README.md
```

## Services Details

### Customer Management API

- **Port**: 3001
- **Endpoints**:
  - `GET /api/purchases` - Get all customer purchases
  - `GET /health` - Health check
- **Features**:
  - Consumes purchase messages from Kafka
  - Stores purchases in MongoDB
  - RESTful API for retrieving purchases

### Customer Facing Web Server

- **Port**: 3000
- **Endpoints**:
  - `POST /api/buy` - Create a purchase (publishes to Kafka)
  - `GET /api/purchases` - Get all purchases (proxies to Customer Management API)
  - `GET /health` - Health check
- **Features**:
  - Publishes purchase events to Kafka
  - Proxies requests to Customer Management API

### Frontend

- **Port**: 80 (in K8s)
- **Features**:
  - Buy button - Sends purchase request
  - GetAllUserBuys button - Displays purchase history

## Autoscaling

The system uses **Horizontal Pod Autoscaler (HPA)** with custom metrics:

- **Request Rate**: Number of HTTP requests per second
- **Kafka Consumer Lag**: Messages waiting to be processed
- **Response Time**: Average API response time

HPA configuration:
- Min replicas: 2
- Max replicas: 10
- Target metrics: Request rate > 50 req/s, Consumer lag > 100 messages

## CI/CD Pipeline

The GitHub Actions workflow includes:

1. **Linting & Testing**: Run ESLint and unit tests
2. **Build**: Build Docker images
3. **Push**: Push images to Docker Hub (or GitHub Container Registry)
4. **Deploy**: Deploy to Kubernetes cluster

See `.github/workflows/ci-cd.yml` for details.

## Configuration

### Environment Variables

**Customer Management API**:
- `MONGODB_URI`: MongoDB connection string
- `KAFKA_BROKERS`: Kafka broker addresses
- `KAFKA_TOPIC`: Kafka topic name
- `PORT`: Server port (default: 3001)

**Customer Facing Server**:
- `KAFKA_BROKERS`: Kafka broker addresses
- `KAFKA_TOPIC`: Kafka topic name
- `CUSTOMER_MANAGEMENT_API_URL`: URL of Customer Management API
- `PORT`: Server port (default: 3000)

**Frontend**:
- `REACT_APP_API_URL`: Customer Facing Server URL

## Development

### Local Development

```bash
# Install dependencies
npm run install:all

# Run services locally
cd services/customer-management-api && npm run dev
cd services/customer-facing-server && npm run dev
cd frontend && npm start
```

### Testing

```bash
# Run all tests
npm run test:all

# Run tests for specific service
cd services/customer-management-api && npm test
```

## Monitoring & Logging

- **Health Checks**: All services expose `/health` endpoints
- **Logging**: Structured JSON logging
- **Metrics**: Prometheus-compatible metrics endpoints

## Security Considerations

- Secrets managed via Kubernetes Secrets
- Environment variables for sensitive data
- Input validation on all endpoints
- CORS configuration for frontend

## Troubleshooting

### Pods not starting

```bash
# Check pod logs
kubectl logs <pod-name> -l assignment-uuid=e271b052-9200-4502-b491-62f1649c07

# Check pod events
kubectl describe pod <pod-name>
```

### Services not connecting

```bash
# Verify service endpoints
kubectl get endpoints

# Test service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
```

### Kafka/MongoDB connection issues

```bash
# Check infrastructure pods
kubectl get pods -n kafka
kubectl get pods -n mongodb

# Verify connection strings in configmaps
kubectl get configmap -o yaml
```

## License

MIT

## Assignment UUID

All Kubernetes resources are labeled with: `e271b052-9200-4502-b491-62f1649c07`

