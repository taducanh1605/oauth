/**
 * Internationalization (i18n) Module
 * Handles language management and translations
 */

// Language configurations
const LANGUAGES = {
    vi: {
        name: 'Tiếng Việt',
        flag: '🇻🇳',
        translations: {
            // Header
            'app.title': 'OAuth Portal',
            'status.checking': 'Đang kiểm tra server...',
            'status.online': 'Server hoạt động',
            'status.offline': 'Server không khả dụng',
            'status.no_network': 'Không có kết nối mạng',
            
            // Tabs
            'tab.login': 'Đăng nhập',
            'tab.register': 'Đăng ký', 
            'tab.apps': 'Ứng dụng',
            
            // Login
            'login.title': 'Đăng nhập vào hệ thống',
            'login.email': 'Email',
            'login.password': 'Mật khẩu',
            'login.submit': 'Đăng nhập',
            'login.google': 'Đăng nhập với Google',
            'login.facebook': 'Đăng nhập với Facebook',
            'login.or': 'HOẶC',
            
            // Register
            'register.title': 'Tạo tài khoản mới',
            'register.name': 'Họ và tên',
            'register.email': 'Email',
            'register.password': 'Mật khẩu',
            'register.confirm_password': 'Xác nhận mật khẩu',
            'register.submit': 'Tạo tài khoản',
            
            // Apps
            'apps.title': 'Ứng dụng đã đăng ký',
            'apps.refresh': 'Làm mới',
            'apps.login_prompt': 'Vui lòng đăng nhập để xem danh sách ứng dụng của bạn.',
            'apps.no_apps_user': 'Bạn chưa đăng nhập vào ứng dụng nào.',
            'apps.no_apps_system': 'Chưa có ứng dụng nào được đăng ký trong hệ thống.',
            'apps.login_count': 'lần đăng nhập',
            'apps.users': 'users',
            'apps.no_description': 'Không có mô tả',
            
            // UI
            'ui.loading': 'Đang xử lý...',
            
            // Offline
            'offline.title': 'Server không khả dụng',
            'offline.message': 'Vui lòng kiểm tra lại kết nối hoặc liên hệ quản trị viên.',
            'offline.retry': 'Kiểm tra lại',
            
            // User info
            'user.logout': 'Đăng xuất',
            'user.logged_in': 'Đã đăng nhập',
            
            // Messages
            'msg.login_success': 'Đăng nhập thành công!',
            'msg.login_failed': 'Đăng nhập thất bại',
            'msg.register_success': 'Đăng ký thành công! Vui lòng đăng nhập.',
            'msg.register_failed': 'Đăng ký thất bại',
            'msg.logout_success': 'Đã đăng xuất khỏi hệ thống',
            'msg.server_unavailable': 'Server không khả dụng. Vui lòng thử lại sau.',
            'msg.server_recovered': 'Server đã hoạt động trở lại',
            'msg.server_disconnected': 'Server không thể kết nối',
            'msg.network_recovered': 'Kết nối mạng đã được khôi phục',
            'msg.network_lost': 'Mất kết nối mạng',
            'msg.password_mismatch': 'Mật khẩu xác nhận không khớp',
            'msg.password_too_short': 'Mật khẩu phải có ít nhất 6 ký tự',
            'msg.connection_error': 'Lỗi kết nối. Vui lòng thử lại sau.',
            'msg.apps_refreshed': 'Đã cập nhật danh sách ứng dụng',
            'msg.apps_load_failed': 'Lỗi khi tải danh sách ứng dụng',
            'msg.token_expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            'msg.unexpected_error': 'Đã xảy ra lỗi không mong muốn',
            'msg.oauth_url_error': 'Không thể lấy OAuth URL',
            'msg.popup_blocked': 'Popup bị chặn. Vui lòng cho phép popup và thử lại.',
            'msg.oauth_signin_error': 'Lỗi khi đăng nhập',
            'msg.oauth_process_error': 'Lỗi khi xử lý dữ liệu đăng nhập',
            'msg.oauth_auth_failed': 'Xác thực OAuth thất bại',
            'msg.oauth_timeout': 'Thời gian đăng nhập quá hạn. Vui lòng thử lại.',
            'msg.token_check_failed': 'Không thể kiểm tra token. Đang sử dụng thông tin đã lưu.',
            'msg.token_auth_failed': 'Không thể xác thực token. Vui lòng đăng nhập lại nếu gặp lỗi.',
            'btn.retry': 'Thử lại',
            'apps.server_offline_title': 'Server không khả dụng',
            'apps.server_offline_msg': 'Không thể kết nối đến server để tải danh sách ứng dụng.',
            'apps.no_apps_available_title': 'Không có ứng dụng nào',
            'apps.no_apps_available_msg': 'Hiện tại chưa có ứng dụng nào được đăng ký trong hệ thống.',
            'apps.load_failed_title': 'Lỗi tải danh sách ứng dụng',
            'apps.load_failed_msg': 'Không thể tải danh sách ứng dụng. Vui lòng thử lại sau.',
            'apps.no_apps_title': 'Không có ứng dụng',
            'apps.no_apps_msg': 'Không có ứng dụng nào để hiển thị.'
        }
    },
    en: {
        name: 'English',
        flag: '🇺🇸',
        translations: {
            // Header
            'app.title': 'OAuth Portal',
            'status.checking': 'Checking server...',
            'status.online': 'Server online',
            'status.offline': 'Server unavailable',
            'status.no_network': 'No network connection',
            
            // Tabs
            'tab.login': 'Login',
            'tab.register': 'Register',
            'tab.apps': 'Applications',
            
            // Login
            'login.title': 'Sign in to system',
            'login.email': 'Email',
            'login.password': 'Password',
            'login.submit': 'Sign In',
            'login.google': 'Sign in with Google',
            'login.facebook': 'Sign in with Facebook',
            'login.or': 'OR',
            
            // Register
            'register.title': 'Create new account',
            'register.name': 'Full Name',
            'register.email': 'Email',
            'register.password': 'Password',
            'register.confirm_password': 'Confirm Password',
            'register.submit': 'Create Account',
            
            // Apps
            'apps.title': 'Registered Applications',
            'apps.refresh': 'Refresh',
            'apps.login_prompt': 'Please login to view your application list.',
            'apps.no_apps_user': 'You have not logged into any applications yet.',
            'apps.no_apps_system': 'No applications registered in the system.',
            'apps.login_count': 'logins',
            'apps.users': 'users',
            'apps.no_description': 'No description',
            
            // UI
            'ui.loading': 'Processing...',
            
            // Offline
            'offline.title': 'Server Unavailable',
            'offline.message': 'Please check your connection or contact administrator.',
            'offline.retry': 'Retry',
            
            // User info
            'user.logout': 'Logout',
            'user.logged_in': 'Logged in',
            
            // Messages
            'msg.login_success': 'Login successful!',
            'msg.login_failed': 'Login failed',
            'msg.register_success': 'Registration successful! Please login.',
            'msg.register_failed': 'Registration failed',
            'msg.logout_success': 'Logged out successfully',
            'msg.server_unavailable': 'Server unavailable. Please try again later.',
            'msg.server_recovered': 'Server is back online',
            'msg.server_disconnected': 'Cannot connect to server',
            'msg.network_recovered': 'Network connection restored',
            'msg.network_lost': 'Network connection lost',
            'msg.password_mismatch': 'Password confirmation does not match',
            'msg.password_too_short': 'Password must be at least 6 characters',
            'msg.connection_error': 'Connection error. Please try again later.',
            'msg.apps_refreshed': 'Application list updated',
            'msg.apps_load_failed': 'Failed to load application list',
            'msg.token_expired': 'Session expired. Please login again.',
            'msg.unexpected_error': 'An unexpected error occurred',
            'msg.oauth_url_error': 'Cannot get OAuth URL',
            'msg.popup_blocked': 'Popup is blocked. Please allow popups and try again.',
            'msg.oauth_signin_error': 'Error signing in',
            'msg.oauth_process_error': 'Error processing login data',
            'msg.oauth_auth_failed': 'OAuth authentication failed',
            'msg.oauth_timeout': 'Login timeout. Please try again.',
            'msg.token_check_failed': 'Unable to verify token. Using cached information.',
            'msg.token_auth_failed': 'Unable to authenticate token. Please re-login if you encounter errors.',
            'btn.retry': 'Retry',
            'apps.server_offline_title': 'Server Unavailable',
            'apps.server_offline_msg': 'Cannot connect to server to load application list.',
            'apps.no_apps_available_title': 'No Applications Available',
            'apps.no_apps_available_msg': 'Currently no applications are registered in the system.',
            'apps.load_failed_title': 'Failed to Load Application List',
            'apps.load_failed_msg': 'Cannot load application list. Please try again later.',
            'apps.no_apps_title': 'No Applications',
            'apps.no_apps_msg': 'No applications to display.'
        }
    },
    fr: {
        name: 'Français',
        flag: '🇫🇷',
        translations: {
            // Header
            'app.title': 'Portail OAuth',
            'status.checking': 'Vérification du serveur...',
            'status.online': 'Serveur en ligne',
            'status.offline': 'Serveur indisponible',
            'status.no_network': 'Pas de connexion réseau',
            
            // Tabs
            'tab.login': 'Connexion',
            'tab.register': 'Inscription',
            'tab.apps': 'Applications',
            
            // Login
            'login.title': 'Se connecter au système',
            'login.email': 'Email',
            'login.password': 'Mot de passe',
            'login.submit': 'Se connecter',
            'login.google': 'Se connecter avec Google',
            'login.facebook': 'Se connecter avec Facebook',
            'login.or': 'OU',
            
            // Register
            'register.title': 'Créer un nouveau compte',
            'register.name': 'Nom complet',
            'register.email': 'Email',
            'register.password': 'Mot de passe',
            'register.confirm_password': 'Confirmer le mot de passe',
            'register.submit': 'Créer un compte',
            
            // Apps
            'apps.title': 'Applications enregistrées',
            'apps.refresh': 'Actualiser',
            'apps.login_prompt': 'Veuillez vous connecter pour voir votre liste d\'applications.',
            'apps.no_apps_user': 'Vous ne vous êtes connecté à aucune application.',
            'apps.no_apps_system': 'Aucune application enregistrée dans le système.',
            'apps.login_count': 'connexions',
            'apps.users': 'utilisateurs',
            'apps.no_description': 'Aucune description',
            
            // UI
            'ui.loading': 'Traitement en cours...',
            
            // Offline
            'offline.title': 'Serveur indisponible',
            'offline.message': 'Veuillez vérifier votre connexion ou contacter l\'administrateur.',
            'offline.retry': 'Réessayer',
            
            // User info
            'user.logout': 'Déconnexion',
            'user.logged_in': 'Connecté',
            
            // Messages
            'msg.login_success': 'Connexion réussie!',
            'msg.login_failed': 'Échec de connexion',
            'msg.register_success': 'Inscription réussie! Veuillez vous connecter.',
            'msg.register_failed': 'Échec de l\'inscription',
            'msg.logout_success': 'Déconnexion réussie',
            'msg.server_unavailable': 'Serveur indisponible. Veuillez réessayer plus tard.',
            'msg.server_recovered': 'Le serveur est de nouveau en ligne',
            'msg.server_disconnected': 'Impossible de se connecter au serveur',
            'msg.network_recovered': 'Connexion réseau rétablie',
            'msg.network_lost': 'Connexion réseau perdue',
            'msg.password_mismatch': 'La confirmation du mot de passe ne correspond pas',
            'msg.password_too_short': 'Le mot de passe doit contenir au moins 6 caractères',
            'msg.connection_error': 'Erreur de connexion. Veuillez réessayer plus tard.',
            'msg.apps_refreshed': 'Liste des applications mise à jour',
            'msg.apps_load_failed': 'Échec du chargement de la liste des applications',
            'msg.token_expired': 'Session expirée. Veuillez vous reconnecter.',
            'msg.unexpected_error': 'Une erreur inattendue s\'est produite',
            'msg.oauth_url_error': 'Impossible d\'obtenir l\'URL OAuth',
            'msg.popup_blocked': 'Popup bloquée. Veuillez autoriser les popups et réessayer.',
            'msg.oauth_signin_error': 'Erreur lors de la connexion',
            'msg.oauth_process_error': 'Erreur lors du traitement des données de connexion',
            'msg.oauth_auth_failed': 'Échec de l\'authentification OAuth',
            'msg.oauth_timeout': 'Délai de connexion dépassé. Veuillez réessayer.',
            'msg.token_check_failed': 'Impossible de vérifier le token. Utilisation des informations mises en cache.',
            'msg.token_auth_failed': 'Impossible d\'authentifier le token. Veuillez vous reconnecter si vous rencontrez des erreurs.',
            'btn.retry': 'Réessayer',
            'apps.server_offline_title': 'Serveur indisponible',
            'apps.server_offline_msg': 'Impossible de se connecter au serveur pour charger la liste des applications.',
            'apps.no_apps_available_title': 'Aucune application disponible',
            'apps.no_apps_available_msg': 'Actuellement aucune application n\'est enregistrée dans le système.',
            'apps.load_failed_title': 'Échec du chargement de la liste des applications',
            'apps.load_failed_msg': 'Impossible de charger la liste des applications. Veuillez réessayer plus tard.',
            'apps.no_apps_title': 'Aucune application',
            'apps.no_apps_msg': 'Aucune application à afficher.'
        }
    }
};

// Current language state
let currentLanguage = 'vi';

/**
 * Translation function
 * @param {string} key - Translation key
 * @returns {string} Translated text or the key itself if not found
 */
function t(key) {
    return LANGUAGES[currentLanguage].translations[key] || key;
}

/**
 * Set current language and update UI
 * @param {string} lang - Language code (vi, en, fr)
 */
function setLanguage(lang) {
    if (LANGUAGES[lang]) {
        currentLanguage = lang;
        
        // Save to localStorage with CONFIG key (if CONFIG is available)
        if (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.LANGUAGE, lang);
        } else {
            localStorage.setItem('oauth.language', lang);
        }
        
        updateAllTexts();
        updateServerStatusLanguage(); // Update server status text with new language
        updateLanguageSelector();
    }
}

/**
 * Initialize language system
 */
function initializeLanguage() {
    // Determine storage key
    const storageKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS) 
        ? CONFIG.STORAGE_KEYS.LANGUAGE 
        : 'oauth.language';
    
    const savedLang = localStorage.getItem(storageKey);
    if (savedLang && LANGUAGES[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // Auto-detect browser language
        const browserLang = navigator.language.substr(0, 2);
        if (LANGUAGES[browserLang]) {
            currentLanguage = browserLang;
        }
    }
    updateLanguageSelector();
}

/**
 * Update all translatable elements in the DOM
 */
function updateAllTexts() {
    // Update all translatable elements except server status
    document.querySelectorAll('[data-i18n]').forEach(element => {
        // Skip server status element to avoid overriding current server state
        if (element.id === 'statusText') {
            return;
        }
        
        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'email' || element.type === 'password')) {
            element.placeholder = t(key);
        } else {
            element.textContent = t(key);
        }
    });
    
    // Update tab display names cache
    updateTabDisplayNames();
    
    // Update no-apps message if currently displayed
    const appsList = document.getElementById('appsList');
    if (appsList && appsList.querySelector('.no-apps-message')) {
        // Re-trigger the no-apps message display with current language
        const activeTab = document.getElementById('appsTab');
        if (activeTab && activeTab.classList.contains('active')) {
            // Check what type of no-apps message should be displayed
            if (typeof window.displayNoAppsMessage === 'function' && typeof window.serverOnline !== 'undefined') {
                if (!window.serverOnline) {
                    window.displayNoAppsMessage('server_offline');
                } else {
                    // Try to determine the current message type and re-display it
                    const messageIcon = appsList.querySelector('.no-apps-message i');
                    if (messageIcon) {
                        if (messageIcon.classList.contains('fa-server')) {
                            window.displayNoAppsMessage('server_offline');
                        } else if (messageIcon.classList.contains('fa-exclamation-triangle')) {
                            window.displayNoAppsMessage('apps_load_failed');
                        } else {
                            window.displayNoAppsMessage('no_apps_available');
                        }
                    }
                }
            }
        }
    }
}

/**
 * Update language selector to reflect current language
 */
function updateLanguageSelector() {
    const selector = document.getElementById('languageSelect');
    if (selector) {
        selector.value = currentLanguage;
    }
}

/**
 * Update tab display names for dynamic tab switching
 */
function updateTabDisplayNames() {
    // Cache for tab names - used in showTab function  
    if (typeof window !== 'undefined') {
        window.tabDisplayNames = {
            'login': t('tab.login').toLowerCase(),
            'register': t('tab.register').toLowerCase(), 
            'apps': t('tab.apps').toLowerCase()
        };
    }
}

/**
 * Get current language code
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Get available languages
 * @returns {Object} Available languages object
 */
function getAvailableLanguages() {
    return LANGUAGES;
}

/**
 * Update server status text based on current language and server state
 * This function should be called from the main script
 */
function updateServerStatusLanguage() {
    // This function will be called from main script
    // We need elements reference from main script
    if (typeof elements === 'undefined' || !elements.statusText) return;
    
    const currentClass = elements.serverStatus?.className || '';
    
    if (currentClass.includes('online')) {
        elements.statusText.textContent = t('status.online');
    } else if (currentClass.includes('offline')) {
        // Check if it's network issue
        if (!navigator.onLine) {
            elements.statusText.textContent = t('status.no_network');
        } else {
            elements.statusText.textContent = t('status.offline');
        }
    } else if (currentClass.includes('checking')) {
        elements.statusText.textContent = t('status.checking');
    }
}

// Export functions for use in main script (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        t,
        setLanguage,
        initializeLanguage,
        updateAllTexts,
        updateLanguageSelector,
        updateTabDisplayNames,
        updateServerStatusLanguage,
        getCurrentLanguage,
        getAvailableLanguages,
        LANGUAGES
    };
}
