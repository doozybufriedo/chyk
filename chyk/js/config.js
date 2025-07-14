// config.js - Application Configuration

const CONFIG = {
    // Application Info
    VERSION: '2.0.0',
    BUILD_DATE: '2024-12-20',
    APP_NAME: 'CHYK',
    APP_DESCRIPTION: 'Smart Virtual Closet - Organize, Style & Plan Your Wardrobe',
    
    // Debug and Development
    DEBUG: false, // Set to true for development
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    
    // Storage Configuration
    STORAGE_KEYS: {
        STATE: 'chyk_state',
        USER: 'chyk_user',
        CACHE: 'chyk_cache',
        PREFERENCES: 'chyk_preferences',
        THEME: 'chyk_theme',
        SESSION: 'chyk_session_id',
        PENDING_ERRORS: 'chyk_pending_errors',
        LAST_EMAIL: 'chyk_last_email'
    },
    
    // File and Image Limits
    LIMITS: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        MAX_IMAGE_SIZE: 2048, // Max width/height for processing
        MIN_CANVAS_ITEM_SIZE: 50, // Minimum size for canvas items
        MAX_CANVAS_ITEM_SIZE: 300, // Maximum size for canvas items
        MAX_WARDROBE_ITEMS: 1000, // Maximum items in wardrobe
        MAX_SAVED_OUTFITS: 500, // Maximum saved outfits
        NOTIFICATION_DURATION: 3000, // Default notification duration (ms)
        ERROR_NOTIFICATION_DURATION: 5000, // Error notification duration (ms)
        MAX_TAG_LENGTH: 50, // Maximum length for item tags
        MAX_NOTES_LENGTH: 500, // Maximum length for notes
        MAX_OUTFIT_NAME_LENGTH: 100, // Maximum length for outfit names
        SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
        MAX_SEARCH_RESULTS: 100, // Maximum search results to display
        MAX_RECENT_UPLOADS: 10 // Maximum recent uploads to remember
    },
    
    // Touch and Mobile Configuration
    TOUCH: {
        MIN_TARGET_SIZE: 44, // Minimum touch target size (pixels)
        GESTURE_THRESHOLD: 10, // Minimum movement for gesture recognition
        LONG_PRESS_DURATION: 500, // Long press duration (ms)
        SWIPE_THRESHOLD: 100, // Minimum distance for swipe recognition
        PINCH_THRESHOLD: 50, // Minimum distance for pinch recognition
        DOUBLE_TAP_DELAY: 300, // Maximum delay between taps for double tap
        SCROLL_MOMENTUM: 0.95 // Scroll momentum factor for smooth scrolling
    },
    
    // Performance Configuration
    PERFORMANCE: {
        DEBOUNCE_DELAY: 300, // Default debounce delay (ms)
        THROTTLE_DELAY: 16, // Default throttle delay (ms) - ~60fps
        LAZY_LOAD_THRESHOLD: 100, // Lazy load threshold (pixels)
        IMAGE_COMPRESSION_QUALITY: 0.8, // JPEG compression quality
        MAX_CONCURRENT_UPLOADS: 3, // Maximum concurrent file uploads
        CACHE_DURATION: 24 * 60 * 60 * 1000, // Cache duration (24 hours)
        ANIMATION_DURATION: 300, // Default animation duration (ms)
        TRANSITION_DURATION: 200, // Default transition duration (ms)
        MAX_UNDO_HISTORY: 20, // Maximum undo/redo history
        SEARCH_DEBOUNCE: 300, // Search input debounce delay
        AUTO_SAVE_INTERVAL: 30000 // Auto-save interval (30 seconds)
    },
    
    // UI Configuration
    UI: {
        DEFAULT_THEME: 'light',
        THEMES: ['light', 'dark', 'auto'],
        SIDEBAR_WIDTH: 280,
        HEADER_HEIGHT: 70,
        MOBILE_BREAKPOINT: 768,
        TABLET_BREAKPOINT: 1024,
        MAX_NOTIFICATIONS: 5,
        TOAST_POSITION: 'top-right',
        MODAL_BACKDROP_OPACITY: 0.5,
        ANIMATION_EASING: 'ease-in-out',
        GRID_COLUMNS: {
            MOBILE: 2,
            TABLET: 3,
            DESKTOP: 4,
            LARGE: 5
        }
    },
    
    // Image Processing Configuration
    IMAGE_PROCESSING: {
        SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
        THUMBNAIL_SIZE: 150,
        PREVIEW_SIZE: 300,
        CANVAS_MAX_SIZE: 1920,
        COMPRESSION_QUALITY: 0.9,
        BACKGROUND_REMOVAL: {
            ENABLED: true,
            EDGE_THRESHOLD: 30,
            COLOR_TOLERANCE: 25,
            BLUR_RADIUS: 2,
            MIN_BACKGROUND_PIXELS: 100
        },
        TRANSPARENCY_PATTERN: {
            SIZE: 12,
            COLOR_1: '#f0f0f0',
            COLOR_2: '#e0e0e0'
        }
    },
    
    // Canvas Configuration
    CANVAS: {
        DEFAULT_WIDTH: 600,
        DEFAULT_HEIGHT: 600,
        MIN_ZOOM: 0.5,
        MAX_ZOOM: 3.0,
        ZOOM_STEP: 0.1,
        GRID_SIZE: 20,
        SNAP_THRESHOLD: 10,
        SELECTION_COLOR: '#007bff',
        SELECTION_WIDTH: 2,
        HANDLE_SIZE: 8,
        MIN_ITEM_SIZE: 20,
        MAX_ITEM_SIZE: 400
    },
    
    // Planner Configuration
    PLANNER: {
        DEFAULT_VIEW: 'week',
        VIEWS: ['week', 'month'],
        FIRST_DAY_OF_WEEK: 0, // 0 = Sunday, 1 = Monday
        MAX_OUTFITS_PER_DAY: 3,
        REMINDER_TIMES: [
            { value: '7:00', label: '7:00 AM' },
            { value: '8:00', label: '8:00 AM' },
            { value: '9:00', label: '9:00 AM' },
            { value: '19:00', label: '7:00 PM (Night Before)' },
            { value: '20:00', label: '8:00 PM (Night Before)' },
            { value: '21:00', label: '9:00 PM (Night Before)' }
        ],
        DEFAULT_REMINDER_TIME: '8:00',
        EMAIL_REMINDERS: {
            ENABLED: false, // Enable when email service is configured
            TEMPLATE: 'outfit-reminder',
            SUBJECT: 'Your CHYK Outfit Reminder'
        }
    },
    
    // Categories Configuration
    CATEGORIES: {
        CLOTHING: [
            { id: 'tops', name: 'Tops', icon: 'fas fa-tshirt' },
            { id: 'bottoms', name: 'Bottoms', icon: 'fas fa-vest-patches' },
            { id: 'shoes', name: 'Shoes', icon: 'fas fa-shoe-prints' },
            { id: 'accessories', name: 'Accessories', icon: 'fas fa-gem' },
            { id: 'outerwear', name: 'Outerwear', icon: 'fas fa-vest' }
        ],
        OUTFITS: [
            { id: 'work', name: 'Work', color: '#007bff' },
            { id: 'casual', name: 'Casual', color: '#28a745' },
            { id: 'evening', name: 'Evening', color: '#6f42c1' },
            { id: 'sport', name: 'Sport', color: '#fd7e14' },
            { id: 'formal', name: 'Formal', color: '#dc3545' },
            { id: 'custom', name: 'Custom', color: '#6c757d' }
        ]
    },
    
    // API Configuration (for future backend integration)
    API: {
        BASE_URL: '/api/v1',
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        ENDPOINTS: {
            AUTH: '/auth',
            USERS: '/users',
            ITEMS: '/items',
            OUTFITS: '/outfits',
            UPLOAD: '/upload',
            BACKGROUND_REMOVAL: '/process-image'
        },
        RATE_LIMITS: {
            UPLOAD: 10, // per minute
            AUTH: 5, // per minute
            GENERAL: 100 // per minute
        }
    },
    
    // Security Configuration
    SECURITY: {
        CSP_ENABLED: true,
        ALLOWED_ORIGINS: ['*'], // Configure for production
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
        PASSWORD_MIN_LENGTH: 6,
        PASSWORD_REQUIREMENTS: {
            MIN_LENGTH: 6,
            REQUIRE_UPPERCASE: false,
            REQUIRE_LOWERCASE: false,
            REQUIRE_NUMBERS: false,
            REQUIRE_SYMBOLS: false
        },
        SESSION_SECURITY: {
            SECURE_COOKIES: false, // Set to true in production with HTTPS
            SAME_SITE: 'lax',
            HTTP_ONLY: true
        }
    },
    
    // Analytics Configuration (placeholder)
    ANALYTICS: {
        ENABLED: false,
        PROVIDER: null, // 'google', 'mixpanel', 'amplitude', etc.
        TRACKING_ID: null,
        EVENTS: {
            PAGE_VIEW: 'page_view',
            USER_SIGNUP: 'user_signup',
            USER_LOGIN: 'user_login',
            ITEM_UPLOAD: 'item_upload',
            OUTFIT_SAVE: 'outfit_save',
            BACKGROUND_REMOVAL: 'background_removal_used'
        }
    },
    
    // Feature Flags
    FEATURES: {
        BACKGROUND_REMOVAL: true,
        EMAIL_REMINDERS: false, // Enable when email service is ready
        SOCIAL_SHARING: false,
        OUTFIT_COLLABORATION: false,
        AI_SUGGESTIONS: false,
        WEATHER_INTEGRATION: false,
        SHOPPING_INTEGRATION: false,
        WARDROBE_ANALYTICS: false,
        ADVANCED_FILTERS: true,
        BULK_OPERATIONS: true,
        IMPORT_EXPORT: true,
        OFFLINE_MODE: false
    },
    
    // Accessibility Configuration
    ACCESSIBILITY: {
        HIGH_CONTRAST_MODE: false,
        REDUCED_MOTION: false,
        SCREEN_READER_SUPPORT: true,
        KEYBOARD_NAVIGATION: true,
        FOCUS_VISIBLE: true,
        MIN_CONTRAST_RATIO: 4.5,
        FONT_SIZE_MULTIPLIER: 1.0,
        ARIA_ANNOUNCEMENTS: true
    },
    
    // Localization Configuration
    LOCALIZATION: {
        DEFAULT_LOCALE: 'en-US',
        SUPPORTED_LOCALES: ['en-US'],
        DATE_FORMAT: 'MM/dd/yyyy',
        TIME_FORMAT: 'h:mm a',
        NUMBER_FORMAT: 'en-US',
        CURRENCY: 'USD',
        RTL_SUPPORT: false
    },
    
    // Development Configuration
    DEVELOPMENT: {
        HOT_RELOAD: false,
        SOURCE_MAPS: false,
        DEBUG_PANELS: false,
        MOCK_API: true,
        SAMPLE_DATA: true,
        PERFORMANCE_MONITORING: false,
        ERROR_BOUNDARIES: true,
        CONSOLE_WARNINGS: true
    }
};

// Environment-specific overrides
if (typeof window !== 'undefined') {
    // Browser environment
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) {
        // Development environment
        CONFIG.DEBUG = true;
        CONFIG.LOG_LEVEL = 'debug';
        CONFIG.DEVELOPMENT.HOT_RELOAD = true;
        CONFIG.DEVELOPMENT.SOURCE_MAPS = true;
        CONFIG.DEVELOPMENT.DEBUG_PANELS = true;
        CONFIG.ANALYTICS.ENABLED = false;
    } else if (hostname.includes('staging') || hostname.includes('test')) {
        // Staging environment
        CONFIG.DEBUG = false;
        CONFIG.LOG_LEVEL = 'info';
        CONFIG.ANALYTICS.ENABLED = true;
    } else {
        // Production environment
        CONFIG.DEBUG = false;
        CONFIG.LOG_LEVEL = 'warn';
        CONFIG.ANALYTICS.ENABLED = true;
        CONFIG.SECURITY.SECURE_COOKIES = true;
        CONFIG.DEVELOPMENT.SAMPLE_DATA = false;
    }
}

// Freeze configuration to prevent accidental modifications
Object.freeze(CONFIG);

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}