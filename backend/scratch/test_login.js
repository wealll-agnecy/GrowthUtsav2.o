const axios = require('axios');

const testLogin = async () => {
    try {
        console.log('Testing login with admin@growthu.com...');
        const res = await axios.post('http://localhost:5002/api/v1/auth/login', {
            identifier: 'admin@growthu.com',
            password: 'GrowthUtsav2026'
        });
        console.log('Login Success:', res.data.message);
    } catch (err) {
        console.error('Login Failed:', err.response?.data?.message || err.message);
    }
};

testLogin();
