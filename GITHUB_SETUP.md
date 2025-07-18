# GitHub Setup Instructions

## After creating your GitHub repository, run these commands:

```bash
# Add the remote repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## If you get authentication errors:

### Option 1: Use Personal Access Token
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token with 'repo' permissions
3. Use token as password when prompted

### Option 2: Use GitHub CLI
```bash
# Install GitHub CLI if not installed
winget install GitHub.cli

# Authenticate
gh auth login

# Push using GitHub CLI
gh repo create YOUR_REPO_NAME --public --source=. --push
```

## Common Issues and Solutions:

### Issue: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Issue: Authentication failed
- Use Personal Access Token instead of password
- Or use SSH key authentication
- Or use GitHub CLI

### Issue: "Updates were rejected"
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

## Verify Setup:
```bash
git remote -v
git status
git log --oneline
```