# Backend Deployment Guide

## Production Environment Variables

Set the following environment variables in your production environment (Railway):

```
NODE_ENV=production
PORT=3002
DATABASE_PATH=/app/data/users.db
JWT_SECRET=your_production_jwt_secret_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Health Check

The server includes a health check endpoint at `/health` that returns:
- Server status
- Current timestamp
- Server uptime
- Environment mode

## CORS Configuration

The server automatically configures CORS based on the environment:
- **Development**: Allows all origins (`*`)
- **Production**: Restricts to specified frontend URLs and Vercel/Railway domains

## Database Persistence

- Database file location is configurable via `DATABASE_PATH` environment variable
- Default location: `./users.db` (development) or `/app/data/users.db` (production)
- Includes graceful shutdown handling to properly close database connections

## Deployment Steps

1. Set environment variables in Railway dashboard
2. Deploy the server code
3. Verify health check endpoint responds at `https://your-backend.railway.app/health`
4. Test authentication and WebSocket connections

## Monitoring

- Health check endpoint: `/health`
- Server logs include connection and room management events
- Graceful shutdown handling for SIGTERM and SIGINT signals