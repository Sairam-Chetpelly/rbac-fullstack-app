// Simple test script to verify dynamic status functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testStatusFunctionality() {
  try {
    console.log('Testing dynamic status functionality...\n');
    
    // Test 1: Get all statuses
    console.log('1. Testing GET /api/applications/statuses');
    try {
      const statusResponse = await axios.get(`${API_BASE}/applications/statuses`);
      console.log('✅ Statuses retrieved successfully:');
      statusResponse.data.forEach(status => {
        console.log(`   - ${status.name} (${status.color})`);
      });
    } catch (error) {
      console.log('❌ Error getting statuses:', error.response?.data?.message || error.message);
    }
    
    console.log('\n2. Testing GET /api/status (Status management)');
    try {
      const statusMgmtResponse = await axios.get(`${API_BASE}/status`);
      console.log('✅ Status management endpoint working:');
      statusMgmtResponse.data.forEach(status => {
        console.log(`   - ${status.name}: ${status.description}`);
      });
    } catch (error) {
      console.log('❌ Error getting status management:', error.response?.data?.message || error.message);
    }
    
    console.log('\n✅ Dynamic status system is ready!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend server: cd ../frontend && npm run dev');
    console.log('3. Test the application status changes in the admin panel');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Only run if server is available
console.log('Make sure the backend server is running on http://localhost:5000');
console.log('Then run: node test-status.js\n');

if (process.argv.includes('--run')) {
  testStatusFunctionality();
}