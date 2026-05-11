const fetch = require('node-fetch');

async function testConnection() {
    try {
        console.log("Testing connection to http://127.0.0.1:5000/history...");
        const response = await fetch('http://127.0.0.1:5000/history');
        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS: Connection working!");
            console.log("Data received:", data);
        } else {
            console.log(`FAILURE: Server returned status ${response.status}`);
        }
    } catch (error) {
        console.error("FAILURE: Could not connect to backend.");
        console.error(error);
    }
}

testConnection();
