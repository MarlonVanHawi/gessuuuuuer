@echo off
echo Pushing to GitHub repository: https://github.com/MarlonVanHawi/gessuuuuuer.git
echo.

echo Checking git status...
git status
echo.

echo Adding all files...
git add .
echo.

echo Committing changes...
git commit -m "Add Railway deployment configuration and backend setup"
echo.

echo Setting up remote (if not already done)...
git remote add origin https://github.com/MarlonVanHawi/gessuuuuuer.git 2>nul
echo.

echo Pushing to GitHub...
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Code pushed to GitHub!
    echo You can now proceed with Railway deployment.
) else (
    echo.
    echo If you get authentication errors, you may need to:
    echo 1. Use a Personal Access Token instead of password
    echo 2. Or set up SSH keys
    echo 3. Or use GitHub CLI: gh auth login
    echo.
    echo For Personal Access Token:
    echo - Go to GitHub Settings ^> Developer settings ^> Personal access tokens
    echo - Generate new token with 'repo' permissions
    echo - Use the token as your password when prompted
)

echo.
pause