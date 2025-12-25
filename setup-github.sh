#!/bin/bash

# Setup and push to GitHub repository
# Usage: ./setup-github.sh <repo-name>

REPO_NAME=${1:-"devops-assignment"}
GITHUB_USER="ybello33"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo "=========================================="
echo "GitHub Repository Setup"
echo "=========================================="
echo "Repository name: $REPO_NAME"
echo "GitHub user: $GITHUB_USER"
echo "Repository URL: $REPO_URL"
echo ""

# Check if remote already exists
if git remote get-url origin &>/dev/null; then
    echo "Remote 'origin' already exists. Updating URL..."
    git remote set-url origin "$REPO_URL"
else
    echo "Adding remote 'origin'..."
    git remote add origin "$REPO_URL"
fi

# Set branch to main
git branch -M main 2>/dev/null || true

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Create the repository on GitHub:"
echo "   Go to: https://github.com/new"
echo "   Repository name: $REPO_NAME"
echo "   Description: Production DevOps Engineer Home Assignment"
echo "   Visibility: Private (or Public)"
echo "   DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2. Once the repository is created, run:"
echo "   git push -u origin main"
echo ""
echo "Or if you want to push now (will fail if repo doesn't exist):"
read -p "Push now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing to GitHub..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "Repository: $REPO_URL"
    else
        echo ""
        echo "❌ Push failed. Please:"
        echo "1. Create the repository on GitHub first"
        echo "2. Then run: git push -u origin main"
    fi
fi

