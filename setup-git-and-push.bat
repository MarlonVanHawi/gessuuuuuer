@echo off
echo Setting up Git and pushing to GitHub...
echo.

echo Step 1: Configure Git (if not already done)
echo Please enter your name and email for Git configuration:
set /p USERNAME="Enter your name: "
set /p EMAIL="Enter your email: "

git config --global user.name "%USERNAME%"
git config --global user.email "%EMAIL%"

echo.
echo Step 2: Check current status
git status

echo.
echo Step 3: Add all files
git add .

echo.
echo Step 4: Commit changes
git commit -m "Add Railway deployment configuration and backend setup"

echo.
echo Step 5: Set main branch
git branch -M main

echo.
echo Now you need to:
echo 1. Create a repository on GitHub.com
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_GITHUB_URL
echo 4. Run: git push -u origin main
echo.

echo Repository is ready for GitHub!
pause