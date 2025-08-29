// Configuration
const API_BASE = "https://pika-proxy.taducanhbkhn.workers.dev";

const CONFIG = {
    SERVER_URL: API_BASE, // Địa chỉ server API
    STORAGE_KEYS: {
        TOKEN: 'authToken',
        USER: 'oauth.user',
        LANGUAGE: 'oauth.language'
    }
};

// State management
let currentUser = null;
let serverOnline = false;
let healthCheckInterval = null;
let consecutiveTimeouts = 0;

// DOM Elements
let elements = {};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    try {
        initializeElements();
        initializeApp();
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

function initializeElements() {
    elements = {
        // Status
        serverStatus: document.getElementById('serverStatus'),
        statusText: document.getElementById('statusText'),
        offlineMessage: document.getElementById('offlineMessage'),
        
        // User info
        userInfo: document.getElementById('userInfo'),
        userName: document.getElementById('userName'),
        userEmail: document.getElementById('userEmail'),
        
        // Forms
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        
        // Apps
        appsList: document.getElementById('appsList'),
        loginPrompt: document.getElementById('loginPrompt'),
        refreshAppsBtn: document.getElementById('refreshAppsBtn'),
        
        // Loading
        loadingOverlay: document.getElementById('loadingOverlay'),
        toastContainer: document.getElementById('toastContainer')
    };
}

async function initializeApp() {
    // Initialize language first
    initializeLanguage();
    
    // Check server health initially
    await checkServerHealth(false);

    // Check if user is already logged in
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);

    if (token) {
        // We have a token, let's validate it and get user info
        try {
            await validateTokenAndSetUser(token, userData);
        } catch (error) {
            console.error('Error validating token:', error);
            clearStoredAuth();
            setTimeout(() => {
                showTab('login');
            }, 100);
        }
    } else {
        // If no token, ensure showing login tab
        setTimeout(() => {
            showTab('login');
        }, 100);
    }

    // Start periodic health check
    startPeriodicHealthCheck();

    // Setup form listeners
    setupEventListeners();

    // Update UI based on server status
    updateUIBasedOnServerStatus();

    // Update all texts after initialization
    updateAllTexts();
}function startPeriodicHealthCheck() {
    // Clear any existing interval
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    // Check every 15 seconds
    healthCheckInterval = setInterval(async () => {
        // Always do a full check to detect recovery
        await checkServerHealth(false);
    }, 15000);
}

function stopPeriodicHealthCheck() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}

function setupEventListeners() {
    // Login form
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    
    // Refresh apps button
    if (elements.refreshAppsBtn) {
        elements.refreshAppsBtn.addEventListener('click', refreshApps);
    }
}

// Server health check
async function checkServerHealth(silent = false) {
    if (!silent) {
        updateServerStatus('checking', t('status.checking'));
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // Increase timeout to 8 seconds
        
        // Simple GET request without custom headers to avoid CORS issues
        const response = await fetch(`${CONFIG.SERVER_URL}/health?t=${Date.now()}`, {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            const wasOffline = !serverOnline;
            serverOnline = true;
            consecutiveTimeouts = 0; // Reset timeout counter on success
            
            if (!silent) {
                updateServerStatus('online', t('status.online'));
            }
            
            // If server was offline and now online, show recovery message and refresh
            if (wasOffline) {
                if (!silent) {
                    showToast('success', t('msg.server_recovered'));
                }
                
                // If we have a token but currentUser is null (server was offline during init),
                // try to validate token now that server is back online
                const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
                const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
                if (token && !currentUser) {
                    try {
                        await validateTokenAndSetUser(token, userData);
                    } catch (error) {
                        console.error('Failed to validate token after server recovery:', error);
                        clearStoredAuth();
                    }
                }
                
                // Force update UI and reload apps
                updateUIBasedOnServerStatus();
                // If we're on apps tab, refresh the apps list
                const appsTab = document.getElementById('appsTab');
                if (appsTab && appsTab.classList.contains('active')) {
                    await loadAllApps();
                }
            }
        } else {
            throw new Error(`Server response not ok: ${response.status}`);
        }
    } catch (error) {
        console.error('Server health check failed:', error);
        const wasOnline = serverOnline;
        serverOnline = false;
        
        if (error.name === 'AbortError') {
            consecutiveTimeouts++;
            
            if (consecutiveTimeouts >= 3) {
                if (!silent) {
                    updateServerStatus('offline', t('status.offline'));
                }
            } else {
                if (!silent) {
                    updateServerStatus('checking', t('status.checking'));
                }
                // Don't update UI to offline state yet, keep trying
                return;
            }
        } else {
            consecutiveTimeouts = 0; // Reset on non-timeout errors
            if (!silent) {
                updateServerStatus('offline', t('status.offline'));
            }
        }
        
        // Show offline notification only once when transitioning from online to offline
        if (wasOnline && !silent) {
            showToast('error', t('msg.server_disconnected'));
        }
    }
    
    updateUIBasedOnServerStatus();
}

// Manual health check (from "Kiểm tra lại" button)
async function manualHealthCheck() {
    consecutiveTimeouts = 0; // Reset timeout counter for manual check
    
    // Show checking status immediately
    updateServerStatus('checking', t('status.checking'));
    
    // Force a fresh check
    await checkServerHealth(false); // Always show status for manual checks
}

function updateServerStatus(status, text) {
    if (!elements.serverStatus) return;
    
    elements.serverStatus.className = `status-indicator ${status}`;
    if (elements.statusText) {
        elements.statusText.textContent = text;
    }
}

function updateUIBasedOnServerStatus() {
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (serverOnline) {
        elements.offlineMessage.style.display = 'none';
        
        // Show active tab content only
        tabContents.forEach(tab => {
            if (tab.classList.contains('active')) {
                tab.style.display = 'block';
            } else {
                tab.style.display = 'none';
            }
        });
        
        // If no tab is active, show default tab based on user login status
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) {
            if (currentUser) {
                showTab('apps');
            } else {
                showTab('login');
            }
        }
        
        // Load apps if we're on apps tab or if user is logged in
        const appsTab = document.getElementById('appsTab');
        if (appsTab && (appsTab.classList.contains('active') || currentUser)) {
            loadAllApps();
        }
    } else {
        elements.offlineMessage.style.display = 'block';
        tabContents.forEach(tab => {
            tab.style.display = 'none';
        });
    }
    
    // Always update refresh button visibility when server status changes
    updateRefreshButtonVisibility();
}

// Tab management
function showTab(tabName) {
    // Update tab buttons - remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the target tab button
    const targetTabButton = document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`);
    if (targetTabButton && targetTabButton.style.display !== 'none') {
        targetTabButton.classList.add('active');
    }
    
    // Update tab content - hide all first
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Show selected tab
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = 'block';
    }
    
    // Special handling for apps tab
    if (tabName === 'apps') {
        updateAppsTab();
    } else {
        // For non-apps tabs, hide refresh button
        updateRefreshButtonVisibility();
    }
}

// Apps management
function updateAppsTab() {
    // Always update refresh button visibility based on current state
    updateRefreshButtonVisibility();
    
    if (serverOnline && (currentUser || elements.appsList.children.length > 0)) {
        // Server online and either user logged in or apps available - show apps list
        elements.appsList.style.display = 'grid';
        
        // Hide login prompt since user info is now in header
        elements.loginPrompt.style.display = 'none';
        
        // Load apps if we haven't already
        if (elements.appsList.children.length === 0) {
            loadAllApps();
        }
    } else if (serverOnline && !currentUser) {
        // Server online but no user and no apps - show message encouraging login or showing public apps
        elements.appsList.style.display = 'grid';
        elements.loginPrompt.style.display = 'none';
        
        // Only load public apps if apps list is empty
        if (elements.appsList.children.length === 0) {
            loadAllApps();
        }
    } else if (serverOnline) {
        // Server online but edge case - still try to load apps
        elements.appsList.style.display = 'grid';
        elements.loginPrompt.style.display = 'none';
        
        loadAllApps();
    } else {
        // Server offline - hide all, let main offline message show
        elements.loginPrompt.style.display = 'none';
        elements.appsList.style.display = 'none';
    }
}

// Enhanced function to check and update refresh button visibility
function updateRefreshButtonVisibility() {
    if (!elements.refreshAppsBtn) return;
    
    const shouldShowRefreshButton = checkRefreshButtonConditions();
    
    if (shouldShowRefreshButton) {
        elements.refreshAppsBtn.style.display = 'flex';
    } else {
        elements.refreshAppsBtn.style.display = 'none';
    }
}

// Check all conditions for showing refresh button
function checkRefreshButtonConditions() {
    // 1. Server must be online
    if (!serverOnline) {
        return false;
    }
    
    // 2. We must be on apps tab
    const appsTab = document.getElementById('appsTab');
    if (!appsTab || !appsTab.classList.contains('active')) {
        return false;
    }
    
    // 3. Always show refresh button on apps tab when server is online
    // This allows users to:
    // - Load user-specific apps if logged in
    // - Load/refresh public apps if not logged in
    // - Retry loading if there was an error
    const hasApps = elements.appsList && elements.appsList.children.length > 0;
    const hasNoAppsMessage = elements.appsList && elements.appsList.innerHTML.includes('no-apps-message');
    const hasEmptyAppsList = elements.appsList && elements.appsList.innerHTML.trim() === '';
    
    // Show button if server is online and on apps tab
    return hasApps || hasNoAppsMessage || hasEmptyAppsList;
}

async function loadAllApps() {
    if (!serverOnline) {
        displayNoAppsMessage('server_offline');
        return;
    }
    
    // Ensure appsList is visible when loading apps
    if (elements.appsList) {
        elements.appsList.style.display = 'grid';
    }
    
    let publicAppsLoaded = false;
    let userAppsLoaded = false;
    
    // If user is logged in, prioritize user-specific apps
    if (currentUser) {
        try {
            userAppsLoaded = await loadUserApps();
        } catch (error) {
            console.error('User apps failed:', error);
            userAppsLoaded = false;
        }
    }
    
    // If no user apps or user not logged in, try public apps
    if (!userAppsLoaded) {
        try {
            const response = await fetch(`${CONFIG.SERVER_URL}/api/apps`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.data && data.data.length > 0) {
                    displayApps(data.data, false); // false = not user-specific
                    publicAppsLoaded = true;
                }
            }
        } catch (error) {
            console.error('Error loading public apps:', error);
        }
    }
    
    // If both failed, show appropriate message
    if (!publicAppsLoaded && !userAppsLoaded) {
        if (currentUser) {
            displayNoAppsMessage('apps_load_failed');
        } else {
            displayNoAppsMessage('no_apps_available');
        }
    }
}

async function loadUserApps() {
    if (!currentUser || !serverOnline) {
        return false;
    }
    
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    if (!token) {
        return false;
    }
    
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/api/user/apps`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                displayApps(data.data || [], true); // true = user-specific
                return true;
            } else {
                return false;
            }
        } else if (response.status === 401) {
            // Token expired
            clearStoredAuth();
            showToast('error', t('msg.token_expired'));
            displayNoAppsMessage('apps_load_failed', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            return false;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error loading user apps:', error);
        return false;
    }
}

function displayApps(apps, isUserSpecific = false) {
    if (!apps || apps.length === 0) {
        const message = isUserSpecific 
            ? (typeof t === 'function' ? t('apps.no_apps_user') : 'Bạn chưa đăng nhập vào ứng dụng nào')
            : (typeof t === 'function' ? t('apps.no_apps_system') : 'Không có ứng dụng nào');
        
        displayNoAppsMessage('no_apps', message);
        return;
    }
    
    if (!elements.appsList) {
        console.error('appsList element not found!');
        return;
    }
    
    try {
        const appsHtml = apps.map(app => {
            const userStats = isUserSpecific && app.login_count 
                ? `<span><i class="fas fa-user-check"></i> ${app.login_count} ${typeof t === 'function' ? t('apps.login_count') : 'lần đăng nhập'}</span>`
                : '';
            
            const displayName = app.app_display_name || app.app_name || 'Unknown App';
            const appName = app.app_name || 'unknown';
            const description = app.app_description || (typeof t === 'function' ? t('apps.no_description') : 'Không có mô tả');
            const createdDate = formatDate(app.created_at);
                
            return `
                <div class="app-card">
                    <h3>${escapeHtml(displayName)}</h3>
                    <div class="app-name">${escapeHtml(appName)}</div>
                    <div class="app-description">
                        ${escapeHtml(description)}
                    </div>
                    <div class="app-stats">
                        <span>
                            <i class="fas fa-calendar"></i>
                            ${createdDate}
                        </span>
                        ${userStats}
                        ${!isUserSpecific && app.total_users ? `<span><i class="fas fa-users"></i> ${app.total_users} ${typeof t === 'function' ? t('apps.users') : 'người dùng'}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        const finalHtml = appsHtml.join('');
        elements.appsList.innerHTML = finalHtml;
        
        // Ensure appsList is visible after setting content
        elements.appsList.style.display = 'grid';
        
        // Also ensure parent containers are visible
        const appsTab = document.getElementById('appsTab');
        if (appsTab) {
            appsTab.style.display = 'block';
        }
        
        // Update refresh button visibility after displaying apps
        updateRefreshButtonVisibility();
        
    } catch (error) {
        console.error('Error in displayApps:', error);
    }
}

function displayNoAppsMessage(type, customMessage = null) {
    let icon, title, message;
    
    switch (type) {
        case 'server_offline':
            icon = 'fas fa-server';
            title = t('apps.server_offline_title');
            message = t('apps.server_offline_msg');
            break;
        case 'no_apps_available':
            icon = 'fas fa-apps';
            title = t('apps.no_apps_available_title');
            message = t('apps.no_apps_available_msg');
            break;
        case 'apps_load_failed':
            icon = 'fas fa-exclamation-triangle';
            title = t('apps.load_failed_title');
            message = t('apps.load_failed_msg');
            break;
        case 'no_apps':
        default:
            icon = 'fas fa-apps';
            title = t('apps.no_apps_title');
            message = customMessage || t('apps.no_apps_msg');
            break;
    }
    
    elements.appsList.innerHTML = `
        <div class="no-apps-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6b7280;">
            <i class="${icon}" style="font-size: 3rem; margin-bottom: 15px; color: #6b7280;"></i>
            <h3 style="margin-bottom: 10px; color: #374151;">${title}</h3>
            <p style="color: #6b7280; line-height: 1.5;">${message}</p>
            ${type === 'apps_load_failed' ? `<button class="btn btn-secondary" onclick="refreshApps()" style="margin-top: 15px;"><i class="fas fa-sync-alt"></i> ${t('btn.retry')}</button>` : ''}
        </div>
    `;
    
    // Update refresh button visibility after displaying no apps message
    updateRefreshButtonVisibility();
}

async function refreshApps() {
    if (!serverOnline) return;
    
    showLoading(true);
    await loadAllApps();
    showLoading(false);
    
    showToast('success', t('msg.apps_refreshed'));
    
    // Ensure refresh button visibility is updated after refresh
    updateRefreshButtonVisibility();
}

// User interface updates
function updateUserInterface() {
    if (currentUser) {
        // Show user info with animation
        elements.userInfo.style.display = 'block';
        setTimeout(() => {
            elements.userInfo.classList.add('show');
        }, 50);
        elements.userName.textContent = currentUser.name;
        elements.userEmail.textContent = currentUser.email;
        
        // Hide login and register tabs
        updateTabsVisibility(true);
        
        // Ensure switch to apps tab and mark it as active immediately
        showTab('apps');
    } else {
        // Hide user info with animation
        elements.userInfo.classList.remove('show');
        setTimeout(() => {
            elements.userInfo.style.display = 'none';
        }, 400);
        
        // Show login and register tabs again
        updateTabsVisibility(false);
    }
    
    // Update apps tab and refresh button visibility
    updateAppsTab();
}

function updateTabsVisibility(isLoggedIn) {
    const loginTab = document.querySelector('.tab-btn[onclick="showTab(\'login\')"]');
    const registerTab = document.querySelector('.tab-btn[onclick="showTab(\'register\')"]');
    const appsTab = document.querySelector('.tab-btn[onclick="showTab(\'apps\')"]');
    
    if (isLoggedIn) {
        // Hide login and register tabs with animation
        if (loginTab) {
            loginTab.style.opacity = '0';
            loginTab.style.transform = 'scale(0.8)';
            setTimeout(() => {
                loginTab.style.display = 'none';
            }, 300);
        }
        if (registerTab) {
            registerTab.style.opacity = '0';
            registerTab.style.transform = 'scale(0.8)';
            setTimeout(() => {
                registerTab.style.display = 'none';
            }, 300);
        }
        
        // Ensure apps tab is visible and active
        if (appsTab) {
            appsTab.style.display = 'flex';
            appsTab.style.opacity = '1';
            appsTab.style.transform = 'scale(1)';
            // Mark apps tab as active
            setTimeout(() => {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                appsTab.classList.add('active');
            }, 350);
        }
    } else {
        // Show all tabs again with animation
        if (loginTab) {
            loginTab.style.display = 'flex';
            setTimeout(() => {
                loginTab.style.opacity = '1';
                loginTab.style.transform = 'scale(1)';
            }, 50);
        }
        if (registerTab) {
            registerTab.style.display = 'flex';
            setTimeout(() => {
                registerTab.style.opacity = '1';
                registerTab.style.transform = 'scale(1)';
            }, 50);
        }
        if (appsTab) {
            appsTab.style.display = 'flex';
            appsTab.style.opacity = '1';
            appsTab.style.transform = 'scale(1)';
        }
    }
}

// Validate token and set user information
async function validateTokenAndSetUser(token, cachedUserData) {
    // If we have cached user data, try to parse it first
    let cachedUser = null;
    if (cachedUserData) {
        try {
            cachedUser = JSON.parse(cachedUserData);
        } catch (error) {
            console.error('Error parsing cached user data:', error);
        }
    }

    // If server is offline, use cached data if available
    if (!serverOnline && cachedUser) {
        currentUser = cachedUser;
        updateUserInterface();
        return;
    }

    if (!serverOnline && !cachedUser) {
        throw new Error('Server không khả dụng và không có thông tin user đã lưu');
    }

    try {
        // Server is online, validate token
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(`${CONFIG.SERVER_URL}/api/auth`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.data) {
                // Token is valid, use server data
                currentUser = data.data;
                
                // Update localStorage with fresh user data
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(data.data));
                localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
                
                updateUserInterface();
            } else {
                throw new Error('Invalid token response from server: ' + JSON.stringify(data));
            }
        } else if (response.status === 401) {
            // Token is invalid/expired
            throw new Error('Token hết hạn hoặc không hợp lệ');
        } else {
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Token validation error:', error);
        
        if (error.name === 'AbortError') {
            // Timeout - if we have cached data, use it
            if (cachedUser) {
                currentUser = cachedUser;
                updateUserInterface();
                showToast('warning', 'Không thể kiểm tra token. Đang sử dụng thông tin đã lưu.');
                return;
            }
        }
        
        // For other errors, if we have cached user data and it's not a 401, 
        // still use it temporarily
        if (cachedUser && !error.message.includes('401') && !error.message.includes('hết hạn')) {
            currentUser = cachedUser;
            updateUserInterface();
            
            // Show a warning that authentication might be stale
            setTimeout(() => {
                showToast('warning', 'Không thể xác thực token. Vui lòng đăng nhập lại nếu gặp lỗi.');
            }, 2000);
        } else {
            // Token is definitely invalid or we have no cached data
            throw error;
        }
    }
}

function logout() {
    clearStoredAuth();
    currentUser = null;
    
    // Clear apps list when logout
    clearAppsList();
    
    updateUserInterface();
    
    // Switch to login tab after logout
    showTab('login');
    
    showToast('info', t('msg.logout_success'));
}

function clearStoredAuth() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    currentUser = null; // Also clear the current user in memory
}

// Clear apps list and related UI
function clearAppsList() {
    if (elements.appsList) {
        elements.appsList.innerHTML = '';
    }
    
    // After clearing, if we're on apps tab and server is online, try loading public apps
    const appsTab = document.getElementById('appsTab');
    if (serverOnline && appsTab && appsTab.classList.contains('active')) {
        // Load public apps after clearing user-specific apps
        setTimeout(() => {
            loadAllApps();
        }, 100);
    }
    
    // Hide refresh button when no user and no apps
    updateRefreshButtonVisibility();
}

// UI helpers
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
}

function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Remove on click
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// Utility functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
}

// Handle page load
window.addEventListener('load', function() {
    // No special handling needed as we use popup for OAuth
});

// Function to refresh token if needed (can be called from other parts of the app)
async function refreshAuthenticationIfNeeded() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
    
    if (token && !currentUser && serverOnline) {
        try {
            await validateTokenAndSetUser(token, userData);
            return true;
        } catch (error) {
            console.error('Failed to refresh authentication:', error);
            clearStoredAuth();
            showTab('login');
            return false;
        }
    }
    return !!currentUser;
}

// Function to set token from external source (for cross-app integration)
window.setAuthToken = async function(token) {
    if (!token) {
        throw new Error('Token is required');
    }
    
    clearStoredAuth();
    localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
    
    if (serverOnline) {
        try {
            await validateTokenAndSetUser(token, null);
            return true;
        } catch (error) {
            clearStoredAuth();
            throw error;
        }
    } else {
        return true;
    }
};

// Function to get current authentication status
window.getAuthStatus = function() {
    return {
        isAuthenticated: !!currentUser,
        user: currentUser,
        hasToken: !!localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN),
        serverOnline: serverOnline
    };
};

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('error', t('msg.unexpected_error'));
});

// Network status monitoring
window.addEventListener('online', function() {
    showToast('success', t('msg.network_recovered'));
    consecutiveTimeouts = 0; // Reset timeout counter when network is back
    checkServerHealth(false); // Show status when network comes back
});

window.addEventListener('offline', function() {
    showToast('warning', t('msg.network_lost'));
    updateServerStatus('offline', t('status.no_network'));
    serverOnline = false;
    consecutiveTimeouts = 0; // Reset timeout counter when offline
    updateUIBasedOnServerStatus();
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopPeriodicHealthCheck();
});
