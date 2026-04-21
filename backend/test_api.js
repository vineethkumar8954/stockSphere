async function test() {
    try {
        const res = await fetch('http://localhost:3001/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com' })
        });
        const status = res.status;
        const text = await res.text();
        console.log(`Status: ${status}`);
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error("Fetch error:", err.message);
    }
}
test();
