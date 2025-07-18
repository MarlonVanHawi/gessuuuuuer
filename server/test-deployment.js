#!/usr/bin/env node

/**
 * Railway Deployment Test Script
 * 
 * This script helps verify that your Railway deployment is working correctly.
 * Run this after deploying to Railway to test the endpoints.
 * 
 * Usage: node test-deployment.js <your-railway-url>
 * Example: node test-deployment.js https://your-backend.railway.app
 */

const axios = require('axios');

const BASE_URL = process.argv[2];

if (!BASE_URL) {
  console.error('❌ Please provide your Railway URL as an argument');
  console.error('Usage: node test-deployment.js <your-railway-url>');
  console.error('Example: node test-deployment.js https://your-backend.railway.app');
  process.exit(1);
}

async function testDeployment() {
  console.log('🚀 Testing Railway Deployment...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Environment: ${healthResponse.data.environment}`);
    console.log(`   Uptime: ${Math.floor(healthResponse.data.uptime)}s\n`);

    // Test 2: CORS Headers
    console.log('2. Testing CORS Configuration...');
    const corsHeaders = healthResponse.headers;
    if (corsHeaders['access-control-allow-origin']) {
      console.log('✅ CORS headers present');
      console.log(`   Origin: ${corsHeaders['access-control-allow-origin']}\n`);
    } else {
      console.log('⚠️  CORS headers not found (may be normal)\n');
    }

    // Test 3: Registration Endpoint
    console.log('3. Testing Registration Endpoint...');
    const testUser = {
      username: `test_${Date.now()}`,
      password: 'testpassword123'
    };
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/register`, testUser);
      console.log('✅ Registration endpoint working');
      console.log(`   User ID: ${registerResponse.data.userId}\n`);

      // Test 4: Login Endpoint
      console.log('4. Testing Login Endpoint...');
      const loginResponse = await axios.post(`${BASE_URL}/api/login`, testUser);
      console.log('✅ Login endpoint working');
      console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
      console.log(`   Username: ${loginResponse.data.user.username}\n`);

      // Test 5: Leaderboard Endpoint
      console.log('5. Testing Leaderboard Endpoint...');
      const leaderboardResponse = await axios.get(`${BASE_URL}/api/leaderboard`);
      console.log('✅ Leaderboard endpoint working');
      console.log(`   Users found: ${leaderboardResponse.data.length}\n`);

    } catch (authError) {
      if (authError.response?.status === 409) {
        console.log('⚠️  User already exists (this is normal for repeated tests)');
        console.log('✅ Registration endpoint is working\n');
      } else {
        throw authError;
      }
    }

    console.log('🎉 All tests passed! Your Railway deployment is working correctly.');
    console.log('\n📋 Next Steps:');
    console.log('1. Update your frontend FRONTEND_URL environment variable');
    console.log('2. Test WebSocket connections from your frontend');
    console.log('3. Verify database persistence by restarting the service');

  } catch (error) {
    console.error('❌ Deployment test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('   Network error - check if the URL is correct and the service is running');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

testDeployment();