const axios = require('axios');

async function testDemoBooking() {
    try {
        // We need a valid token. Since I don't have one, I'll mock the request in the backend controller directly if I could, 
        // but better to just check the code again.
        console.log("Testing demo booking logic locally...");
        const partialAmount = "330";
        const totalAmount = 600;
        const paid = partialAmount ? parseFloat(partialAmount) : totalAmount;
        console.log("Calculated Paid:", paid);
        console.log("Status:", paid >= totalAmount ? 'completed' : 'partial');
    } catch (err) {
        console.error(err);
    }
}

testDemoBooking();
