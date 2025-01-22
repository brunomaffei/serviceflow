"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = Header;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var ThemeContext_1 = require("../contexts/ThemeContext");
var DefaultLogo_1 = require("./DefaultLogo");
function Header() {
    var navigate = (0, react_router_dom_1.useNavigate)();
    var _a = (0, ThemeContext_1.useTheme)(), isDark = _a.isDark, toggleTheme = _a.toggleTheme;
    var handleLogout = function () {
        localStorage.removeItem("currentUser");
        navigate("/login");
    };
    var logoSrc = localStorage.getItem("companyLogo");
    return (<header className="bg-white shadow-md border-b sticky top-0 z-50 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoSrc ? (<img src={logoSrc} alt="Company Logo" className="h-10 w-10 object-contain rounded"/>) : (<div className="h-10 w-10 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
              <DefaultLogo_1.DefaultLogo />
            </div>)}
          <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
            ORDEM DE SERVIÇO
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 tooltip" title={isDark ? "Modo Claro" : "Modo Escuro"}>
            {isDark ? <lucide_react_1.Sun size={20}/> : <lucide_react_1.Moon size={20}/>}
          </button>
          <button onClick={function () { return navigate("/perfil"); }} className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200 text-blue-600 dark:text-blue-400 tooltip" title="Configurações">
            <lucide_react_1.Settings size={20}/>
          </button>
          <button onClick={handleLogout} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200 text-red-600 dark:text-red-400 tooltip" title="Sair">
            <lucide_react_1.LogOut size={20}/>
          </button>
        </div>
      </div>
    </header>);
}
