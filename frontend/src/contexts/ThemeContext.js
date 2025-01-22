"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = void 0;
exports.ThemeProvider = ThemeProvider;
var react_1 = require("react");
var ThemeContext = (0, react_1.createContext)({
    isDark: false,
    toggleTheme: function () { },
});
function ThemeProvider(_a) {
    var children = _a.children;
    // Initialize theme from localStorage or system preference
    var _b = (0, react_1.useState)(function () {
        // First check localStorage
        var savedTheme = localStorage.getItem('darkTheme');
        if (savedTheme !== null) {
            return JSON.parse(savedTheme);
        }
        // If no saved preference, check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }), isDark = _b[0], setIsDark = _b[1];
    // Apply theme class immediately on mount and when theme changes
    (0, react_1.useEffect)(function () {
        // Apply dark mode class
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
        // Save preference to localStorage
        localStorage.setItem('darkTheme', JSON.stringify(isDark));
    }, [isDark]);
    // Listen for system theme changes
    (0, react_1.useEffect)(function () {
        var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        var handleChange = function (e) {
            // Only update if user hasn't set a preference
            if (localStorage.getItem('darkTheme') === null) {
                setIsDark(e.matches);
            }
        };
        // Add listener
        mediaQuery.addEventListener('change', handleChange);
        // Cleanup
        return function () { return mediaQuery.removeEventListener('change', handleChange); };
    }, []);
    var toggleTheme = function () {
        setIsDark(function (prev) {
            var newValue = !prev;
            // Update localStorage immediately in the toggle function
            localStorage.setItem('darkTheme', JSON.stringify(newValue));
            return newValue;
        });
    };
    return (<ThemeContext.Provider value={{ isDark: isDark, toggleTheme: toggleTheme }}>
      {children}
    </ThemeContext.Provider>);
}
var useTheme = function () {
    var context = (0, react_1.useContext)(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
exports.useTheme = useTheme;
