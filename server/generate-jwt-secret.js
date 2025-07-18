#!/usr/bin/env node

/**
 * JWT Secret Generator
 * 
 * Generates a cryptographically secure JWT secret for production use.
 * Run this script to generate a secret for your Railway environment variables.
 */

const crypto = require('crypto');

function generateJWTSecret() {
  // Generate a 64-byte (512-bit) random secret
  const secret = crypto.randomBytes(64).toString('hex');
  
  console.log('🔐 Generated JWT Secret for Production:');
  console.log('');
  console.log('JWT_SECRET=' + secret);
  console.log('');
  console.log('📋 Instructions:');
  console.log('1. Copy the JWT_SECRET line above');
  console.log('2. Go to your Railway project dashboard');
  console.log('3. Navigate to Variables tab');
  console.log('4. Add JWT_SECRET as an environment variable');
  console.log('5. Paste the generated secret as the value');
  console.log('');
  console.log('⚠️  Important: Keep this secret secure and never commit it to version control!');
}

generateJWTSecret();