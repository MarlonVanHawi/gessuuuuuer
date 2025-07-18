# Railway Deployment Checklist

## Pre-Deployment Setup

- [ ] **Railway Account Created**
  - Visit [railway.app](https://railway.app)
  - Sign up with GitHub/Google/Email
  - Verify email if required

- [ ] **GitHub Repository Connected**
  - Repository is public or Railway has access
  - Latest code is pushed to main/master branch

## Railway Project Configuration

- [ ] **New Project Created**
  - Click "New Project" → "Deploy from GitHub repo"
  - Select your repository
  - Choose the correct branch (usually main/master)

- [ ] **Environment Variables Set**
  ```
  NODE_ENV=production
  PORT=3002
  DATABASE_PATH=/app/data/users.db
  JWT_SECRET=[GENERATE_STRONG_SECRET]
  GOOGLE_MAPS_API_KEY=[YOUR_API_KEY]
  FRONTEND_URL=[YOUR_FRONTEND_URL]
  ```

- [ ] **Build Configuration Verified**
  - Railway detects `railway.json` automatically
  - Build uses NIXPACKS
  - Start command: `npm start`

## Deployment Verification

- [ ] **Initial Deployment Successful**
  - Check Railway dashboard for green status
  - No build errors in logs
  - Service is running

- [ ] **Health Check Working**
  - Visit: `https://your-backend.railway.app/health`
  - Should return JSON with status "OK"

- [ ] **API Endpoints Functional**
  - Run test script: `node test-deployment.js https://your-backend.railway.app`
  - Registration endpoint works
  - Login endpoint works
  - Leaderboard endpoint works

- [ ] **Database Persistence**
  - Create a test user
  - Restart the Railway service
  - Verify user still exists

- [ ] **WebSocket Support**
  - Test from frontend application
  - Verify real-time multiplayer features work

## Post-Deployment Configuration

- [ ] **Custom Domain (Optional)**
  - Configure custom domain in Railway settings
  - Update CORS configuration if needed

- [ ] **Monitoring Setup**
  - Check Railway metrics dashboard
  - Set up alerts if needed

- [ ] **Frontend Integration**
  - Update frontend API URL to Railway URL
  - Test complete application flow

## Security Checklist

- [ ] **Environment Variables Secure**
  - JWT_SECRET is strong and unique
  - Google Maps API key has proper restrictions
  - No sensitive data in code

- [ ] **CORS Properly Configured**
  - Only allows necessary origins
  - Credentials enabled for authenticated requests

- [ ] **Database Security**
  - Database file in persistent volume
  - No SQL injection vulnerabilities

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check package.json dependencies
   - Verify Node.js version compatibility
   - Check Railway build logs

2. **Health Check Fails**
   - Verify PORT environment variable
   - Check if service is binding to correct port
   - Review application logs

3. **Database Issues**
   - Ensure DATABASE_PATH points to persistent volume
   - Check file permissions
   - Verify SQLite3 installation

4. **CORS Errors**
   - Update FRONTEND_URL environment variable
   - Check CORS configuration in index.js
   - Verify frontend is using correct backend URL

### Useful Railway Commands:

```bash
# View logs
railway logs

# Connect to service shell
railway shell

# Deploy specific branch
railway up --detach
```

## Success Criteria

✅ **Deployment is successful when:**
- Health endpoint returns 200 OK
- All API endpoints respond correctly
- Database persists data across restarts
- WebSocket connections work from frontend
- No CORS errors in browser console

---

**Railway URL:** `https://your-backend.railway.app`
**Deployment Date:** `[DATE]`
**Deployed By:** `[YOUR_NAME]`