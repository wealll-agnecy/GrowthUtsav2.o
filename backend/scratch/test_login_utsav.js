const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Testing login with admin@growthutsav.com...');
        const res = await axios.post('http://localhost:5002/api/v1/auth/login', {
            identifier: 'admin@growthutsav.com',
            password: 'GrowthUtsav2026'
        });
        console.log('Login Success:', res.data.message);
    } catch (err) {
        console.error('Login Failed:', err.response?.data?.message || err.message);
    }
};

testLogin();
