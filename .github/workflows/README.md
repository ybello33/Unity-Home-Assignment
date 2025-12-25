# CI/CD Pipeline Documentation

## Setup Instructions

### Required Secrets

Add the following secrets to your GitHub repository:

1. **DOCKER_USERNAME**: Your Docker Hub username
2. **DOCKER_PASSWORD**: Your Docker Hub password or access token
3. **KUBECONFIG** (optional): Base64-encoded kubeconfig file for Kubernetes deployment

### Using GitHub Container Registry

To use GitHub Container Registry instead of Docker Hub:

1. Uncomment the GitHub Container Registry sections in `.github/workflows/ci-cd.yml`
2. Comment out the Docker Hub login section
3. The `GITHUB_TOKEN` is automatically provided by GitHub Actions

### Kubernetes Deployment

The deployment job requires:
- A Kubernetes cluster accessible from GitHub Actions
- A valid kubeconfig file encoded in base64
- Proper RBAC permissions for the service account

To encode your kubeconfig:
```bash
cat ~/.kube/config | base64 -w 0
```

## Pipeline Stages

1. **Lint and Test**: Runs ESLint and tests on all services
2. **Build Images**: Builds Docker images for all services
3. **Deploy**: Deploys to Kubernetes (only on main branch)
4. **Security Scan**: Runs Trivy vulnerability scanner

## Assignment UUID

All resources are labeled with: `e271b052-9200-4502-b491-62f1649c07`

