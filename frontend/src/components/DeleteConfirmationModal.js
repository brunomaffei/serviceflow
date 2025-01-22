"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteConfirmationModal = DeleteConfirmationModal;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function DeleteConfirmationModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, onConfirm = _a.onConfirm, _b = _a.title, title = _b === void 0 ? "Confirmar Exclusão" : _b, _c = _a.message, message = _c === void 0 ? "Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita." : _c;
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
            <lucide_react_1.X className="h-5 w-5"/>
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </p>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none">
            Excluir
          </button>
        </div>
      </div>
    </div>);
}
