"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrderForm = ServiceOrderForm;
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var react_router_dom_1 = require("react-router-dom");
var client_1 = require("../api/client");
function ServiceOrderForm(_a) {
    var _this = this;
    var onSuccess = _a.onSuccess;
    var _b = (0, react_1.useState)([]), items = _b[0], setItems = _b[1];
    var _c = (0, react_1.useState)(""), message = _c[0], setMessage = _c[1];
    var _d = (0, react_hook_form_1.useForm)(), register = _d.register, handleSubmit = _d.handleSubmit, reset = _d.reset;
    var navigate = (0, react_router_dom_1.useNavigate)();
    var addItem = function () {
        setItems(__spreadArray(__spreadArray([], items, true), [
            {
                id: crypto.randomUUID(),
                orderId: crypto.randomUUID(), // Add temporary orderId that will be replaced when the order is created
                quantity: 0,
                description: "",
                unitPrice: 0,
                total: 0,
            },
        ], false));
    };
    var removeItem = function (id) {
        setItems(items.filter(function (item) { return item.id !== id; }));
    };
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var currentUser, total, orderData, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
                    if (!currentUser.id) {
                        throw new Error("Usuário não encontrado");
                    }
                    // Validate items
                    if (items.length === 0) {
                        setMessage("Adicione pelo menos um item à ordem de serviço");
                        return [2 /*return*/];
                    }
                    total = items.reduce(function (acc, item) { return acc + item.total; }, 0);
                    orderData = {
                        client: data.client,
                        date: new Date(data.date).toISOString(),
                        fleet: data.fleet,
                        farm: data.farm || "",
                        description: data.description || "",
                        items: items.map(function (item) { return ({
                            quantity: Number(item.quantity),
                            description: item.description,
                            unitPrice: Number(item.unitPrice),
                            total: Number(item.total),
                        }); }),
                        total: Number(total),
                        userId: currentUser.id,
                    };
                    console.log("Sending order data:", orderData); // Debug log
                    return [4 /*yield*/, client_1.apiClient.createServiceOrder(orderData)];
                case 1:
                    response = _a.sent();
                    console.log("Response:", response); // Debug log
                    reset();
                    setItems([]);
                    setMessage("Ordem de serviço criada com sucesso!");
                    // Remover o redirecionamento automático e usar o onSuccess
                    onSuccess();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error("Erro ao criar ordem de serviço:", error_1);
                    setMessage(error_1 instanceof Error
                        ? error_1.message
                        : "Erro ao criar ordem de serviço");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white dark:bg-gray-800 p-8 rounded-md shadow-lg">
      {message && (<div className={"p-4 rounded-md mb-6 ".concat(message.includes("sucesso")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200")}>
          {message}
        </div>)}

      {/* Informações Principais */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Informações do Serviço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cliente *
            </label>
            <input type="text" {...register("client", {
        required: "Nome do cliente é obrigatório",
    })} placeholder="Nome completo do cliente" className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Data do Serviço *
            </label>
            <input type="date" {...register("date", { required: "Data é obrigatória" })} className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frota/Placa *
            </label>
            <input type="text" {...register("fleet", { required: "Frota/Placa é obrigatória" })} placeholder="Ex: ABC-1234 ou FROTA-001" className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"/>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fazenda
            </label>
            <input type="text" {...register("farm")} placeholder="Nome da fazenda" className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"/>
          </div>
        </div>
      </div>

      {/* Itens do Serviço */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-md border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Itens do Serviço
          </h3>
          <button type="button" onClick={addItem} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
            <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
            Adicionar Item
          </button>
        </div>

        {/* Headers for the items table */}
        <div className="grid grid-cols-[100px_1fr_150px_150px_50px] gap-2 mb-2 px-2">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Quantidade
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Descrição do Serviço
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Preço Unit.
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total
          </div>
          <div></div>
        </div>

        <div className="space-y-2">
          {items.map(function (item, index) { return (<div key={item.id} className="grid grid-cols-[100px_1fr_150px_150px_50px] gap-2 items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
              <input type="number" min="0" placeholder="Qtd." className="w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500" value={item.quantity || ""} onChange={function (e) {
                var newItems = __spreadArray([], items, true);
                newItems[index].quantity = Number(e.target.value);
                newItems[index].total =
                    newItems[index].quantity * newItems[index].unitPrice;
                setItems(newItems);
            }}/>
              <input type="text" placeholder="Ex: Troca de óleo, filtros, etc." className="w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500" value={item.description} onChange={function (e) {
                var newItems = __spreadArray([], items, true);
                newItems[index].description = e.target.value;
                setItems(newItems);
            }}/>
              <input type="number" min="0" step="0.01" placeholder="R$ 0,00" className="w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500" value={item.unitPrice || ""} onChange={function (e) {
                var newItems = __spreadArray([], items, true);
                newItems[index].unitPrice = Number(e.target.value);
                newItems[index].total =
                    newItems[index].quantity * newItems[index].unitPrice;
                setItems(newItems);
            }}/>
              <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-gray-900 dark:text-white text-right">
                R$ {item.total.toFixed(2)}
              </div>
              <button type="button" onClick={function () { return removeItem(item.id); }} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md" title="Remover item">
                <lucide_react_1.Trash2 className="h-5 w-5"/>
              </button>
            </div>); })}

          {items.length > 0 && (<div className="flex justify-end mt-4 border-t dark:border-gray-700 pt-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                Total: R${" "}
                {items.reduce(function (acc, item) { return acc + item.total; }, 0).toFixed(2)}
              </div>
            </div>)}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button type="button" onClick={onSuccess} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm">
          Salvar Ordem de Serviço
        </button>
      </div>
    </form>);
}
