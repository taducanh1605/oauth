/**
 * OAuth Authentication Module
 * Handles Google and Facebook OAuth login flows
 */

// OAuth Configuration
const OAUTH_CONFIG = {
    POPUP_OPTIONS: {
        width: 500,
        height: 600,
        scrollbars: 1,
        resizable: 1,
        menubar: 0,
        toolbar: 0,
        status: 0
    },
    TIMEOUT: 300000 // 5 minutes timeout
};

/**
 * Handle Google OAuth login
 */
async function loginWithGoogle() {
    if (!serverOnline) {
        showToast('error', t('msg.server_unavailable'));
        return;
    }

    try {
        // 1. Get OAuth URL from server
        const response = await fetch(`${CONFIG.SERVER_URL}/api/oauth/google/url?app_name=oauth-portal&app_display_name=OAuth Portal&app_description=OAuth Portal Web App`);
        const data = await response.json();
        
        if (!data.success) {
            showToast('error', data.message || t('msg.oauth_url_error'));
            return;
        }

        // 2. Open popup with Google OAuth URL
        const popup = openOAuthPopup(data.authUrl, 'google_oauth');
        
        if (!popup) {
            showToast('error', t('msg.popup_blocked'));
            return;
        }

        // 3. Listen for OAuth success message
        return new Promise((resolve, reject) => {
            const handleGoogleMessage = (event) => {
                if (event.data.type === 'oauth_success') {
                    handleOAuthSuccess(event.data, popup, handleGoogleMessage);
                    resolve();
                } else if (event.data.type === 'oauth_error') {
                    handleOAuthError(event.data.error, popup, handleGoogleMessage);
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleGoogleMessage);
            
            // Setup popup monitoring
            monitorPopup(popup, handleGoogleMessage, 'Google OAuth');
        });

    } catch (error) {
        console.error('Google login error:', error);
        showToast('error', t('msg.oauth_signin_error') + ': ' + error.message);
        throw error;
    }
}

/**
 * Handle Facebook OAuth login
 */
async function loginWithFacebook() {
    if (!serverOnline) {
        showToast('error', t('msg.server_unavailable'));
        return;
    }

    try {
        // 1. Get OAuth URL from server
        const response = await fetch(`${CONFIG.SERVER_URL}/api/oauth/facebook/url?app_name=oauth-portal&app_display_name=OAuth Portal&app_description=OAuth Portal Web App`);
        const data = await response.json();
        
        if (!data.success) {
            showToast('error', data.message || t('msg.oauth_url_error'));
            return;
        }

        // 2. Open popup with Facebook OAuth URL
        const popup = openOAuthPopup(data.authUrl, 'facebook_oauth');
        
        if (!popup) {
            showToast('error', t('msg.popup_blocked'));
            return;
        }

        // 3. Listen for OAuth success message
        return new Promise((resolve, reject) => {
            const handleFacebookMessage = (event) => {
                if (event.data.type === 'oauth_success') {
                    handleOAuthSuccess(event.data, popup, handleFacebookMessage);
                    resolve();
                } else if (event.data.type === 'oauth_error') {
                    handleOAuthError(event.data.error, popup, handleFacebookMessage);
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleFacebookMessage);
            
            // Setup popup monitoring
            monitorPopup(popup, handleFacebookMessage, 'Facebook OAuth');
        });

    } catch (error) {
        console.error('Facebook login error:', error);
        showToast('error', t('msg.oauth_signin_error') + ': ' + error.message);
        throw error;
    }
}

/**
 * Open OAuth popup window
 */
function openOAuthPopup(url, name) {
    const popupOptions = Object.entries(OAUTH_CONFIG.POPUP_OPTIONS)
        .map(([key, value]) => `${key}=${value}`)
        .join(',');
    
    return window.open(url, name, popupOptions);
}

/**
 * Handle OAuth success
 */
function handleOAuthSuccess(data, popup, messageHandler) {
    try {
        // Store authentication data
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(data.user));
        
        // Update current user and UI
        currentUser = data.user;
        updateUserInterface();
        showToast('success', t('msg.login_success'));
        
        // Clean up
        window.removeEventListener('message', messageHandler);
        if (popup && !popup.closed) {
            popup.close();
        }
        
        console.log('OAuth login successful:', data.user);
    } catch (error) {
        console.error('Error handling OAuth success:', error);
        showToast('error', t('msg.oauth_process_error'));
    }
}

/**
 * Handle OAuth error
 */
function handleOAuthError(error, popup, messageHandler) {
    console.error('OAuth error:', error);
    showToast('error', error || t('msg.oauth_auth_failed'));
    
    // Clean up
    window.removeEventListener('message', messageHandler);
    if (popup && !popup.closed) {
        popup.close();
    }
}

/**
 * Monitor popup window status
 */
function monitorPopup(popup, messageHandler, providerName) {
    const checkInterval = 1000; // Check every second
    let timeoutCounter = 0;
    const maxTimeout = OAUTH_CONFIG.TIMEOUT / checkInterval;
    
    const monitor = setInterval(() => {
        timeoutCounter++;
        
        // Check if popup was closed manually
        if (popup.closed) {
            console.log(`${providerName} popup closed manually`);
            clearInterval(monitor);
            window.removeEventListener('message', messageHandler);
            return;
        }
        
        // Check for timeout
        if (timeoutCounter >= maxTimeout) {
            console.log(`${providerName} popup timeout`);
            clearInterval(monitor);
            window.removeEventListener('message', messageHandler);
            popup.close();
            showToast('error', t('msg.oauth_timeout'));
            return;
        }
        
        // Try to detect if popup has navigated to success page
        try {
            // This will throw an error if popup is on different domain
            if (popup.location.href.includes('success') || popup.location.href.includes('callback')) {
                console.log(`${providerName} popup may have completed`);
                // Let the message handler deal with it
            }
        } catch (e) {
            // Cross-origin, expected
        }
    }, checkInterval);
}

/**
 * Handle local login form
 */
async function handleLogin(event) {
    event.preventDefault();
    
    if (!serverOnline) {
        showToast('error', t('msg.server_unavailable'));
        return;
    }
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store authentication data
            localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(data.user));
            
            currentUser = data.user;
            updateUserInterface();
            
            showToast('success', t('msg.login_success'));
            
            // Reset form
            event.target.reset();
            
        } else {
            showToast('error', data.message || t('msg.login_failed'));
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('error', t('msg.connection_error'));
    } finally {
        showLoading(false);
    }
}

/**
 * Handle registration form
 */
async function handleRegister(event) {
    event.preventDefault();
    
    if (!serverOnline) {
        showToast('error', t('msg.server_unavailable'));
        return;
    }
    
    const formData = new FormData(event.target);
    const password = formData.get('password');
    const password2 = formData.get('password2');
    
    // Validate passwords match
    if (password !== password2) {
        showToast('error', t('msg.password_mismatch'));
        return;
    }
    
    if (password.length < 6) {
        showToast('error', t('msg.password_too_short'));
        return;
    }
    
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: password,
        password2: password2
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('success', t('msg.register_success'));
            
            // Reset form
            event.target.reset();
            
            // Switch to login tab
            showTab('login');
            
            // Pre-fill email in login form
            const emailInput = document.getElementById('loginEmail');
            if (emailInput) {
                emailInput.value = registerData.email;
            }
            
        } else {
            showToast('error', data.message || t('msg.register_failed'));
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast('error', t('msg.connection_error'));
    } finally {
        showLoading(false);
    }
}

// Export functions to global scope for use in main app
window.loginWithGoogle = loginWithGoogle;
window.loginWithFacebook = loginWithFacebook;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
