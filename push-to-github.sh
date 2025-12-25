#!/bin/bash

# Script to push code to GitHub repository
# Usage: ./push-to-github.sh <github-repo-url>

if [ -z "$1" ]; then
    echo "Usage: ./push-to-github.sh <github-repo-url>"
    echo ""
    echo "Example:"
    echo "  ./push-to-github.sh https://github.com/yourusername/devops-assignment.git"
    echo "  or"
    echo "  ./push-to-github.sh git@github.com:yourusername/devops-assignment.git"
    exit 1
fi

REPO_URL=$1

echo "Adding remote repository..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"

echo "Checking current branch..."
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
    git branch -M main
fi

echo "Pushing to GitHub (branch: $BRANCH)..."
git push -u origin "$BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "Repository: $REPO_URL"
    echo "Branch: $BRANCH"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "1. Repository URL is correct"
    echo "2. You have push access to the repository"
    echo "3. Your GitHub credentials are configured"
    echo ""
    echo "If using HTTPS, you may need to use a personal access token"
    echo "If using SSH, make sure your SSH key is added to GitHub"
fi

