#!/bin/bash

# Deployment Script for DevOps Assignment
# Assignment UUID: e271b052-9200-4502-b491-62f1649c07

set -e

ASSIGNMENT_UUID="e271b052-9200-4502-b491-62f1649c07"

echo "=========================================="
echo "DevOps Assignment Deployment Script"
echo "Assignment UUID: $ASSIGNMENT_UUID"
echo "=========================================="

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: kubectl is not configured or cluster is not accessible."
    exit 1
fi

echo ""
echo "Step 1: Deploying Infrastructure (MongoDB, Kafka)..."
kubectl apply -k k8s/infrastructure/

echo ""
echo "Waiting for infrastructure to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb -l assignment-uuid=$ASSIGNMENT_UUID || echo "MongoDB deployment check completed"
kubectl wait --for=condition=available --timeout=300s deployment/kafka -l assignment-uuid=$ASSIGNMENT_UUID || echo "Kafka deployment check completed"

echo ""
echo "Step 2: Deploying Services..."
kubectl apply -k k8s/services/

echo ""
echo "Waiting for services to be ready..."
sleep 10

echo ""
echo "Step 3: Verifying Deployment..."
echo ""
echo "Pods:"
kubectl get pods -l assignment-uuid=$ASSIGNMENT_UUID

echo ""
echo "Services:"
kubectl get services -l assignment-uuid=$ASSIGNMENT_UUID

echo ""
echo "HPA:"
kubectl get hpa -l assignment-uuid=$ASSIGNMENT_UUID

echo ""
echo "=========================================="
echo "Deployment completed!"
echo "=========================================="
echo ""
echo "To access the frontend:"
echo "  kubectl port-forward svc/frontend-service 3000:80"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "To check logs:"
echo "  kubectl logs -l app=customer-management-api -l assignment-uuid=$ASSIGNMENT_UUID"
echo "  kubectl logs -l app=customer-facing-server -l assignment-uuid=$ASSIGNMENT_UUID"
echo "  kubectl logs -l app=frontend -l assignment-uuid=$ASSIGNMENT_UUID"
echo ""

