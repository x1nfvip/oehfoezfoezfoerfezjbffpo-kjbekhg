async function verifyLicense() {
    const licenseKey = document.getElementById('licenseKey').value;
    const loginButton = document.getElementById('keyAuthButton');
    
    loginButton.disabled = true;
    loginButton.innerHTML = 'Verifying... <span class="loading"></span>';

    // KeyAuth API endpoint
    const apiEndpoint = 'https://keyauth.win/api/1.2/';

    try {
        // Initialize KeyAuth session
        const initResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                type: 'init',
                name: "X1nf.vip's Application",
                ownerid: "BChM1Lf47r",
                secret: "39021e34a9807a3f3eaed03377d2398e5484194dca69854added1c2cedce73cd",
                version: "1.0"
            })
        });

        const initData = await initResponse.json();
        
        if (!initData.success) {
            throw new Error(initData.message);
        }

        // Verify license with session
        const verifyResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                type: 'license',
                key: licenseKey,
                name: "X1nf.vip's Application",
                ownerid: "BChM1Lf47r",
                secret: "39021e34a9807a3f3eaed03377d2398e5484194dca69854added1c2cedce73cd",
                sessionid: initData.sessionid
            })
        });

        const verifyData = await verifyResponse.json();
        
        if (verifyData.success) {
            showNotification('License verified successfully!');
            document.getElementById('keyAuthSection').style.display = 'none';
            document.getElementById('discordSection').style.display = 'block';
        } else {
            throw new Error(verifyData.message || 'Invalid license key');
        }
    } catch (error) {
        showNotification(error.message);
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = 'Activate License';
    }
}
