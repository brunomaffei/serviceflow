"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
var bcryptjs_1 = require("bcryptjs");
var prisma_1 = require("../../lib/prisma");
exports.api = {
    // Autenticação
    login: function (email, password) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isValid, _, userWithoutPassword, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                                where: { email: email },
                                include: {
                                    companyInfo: true,
                                },
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
                    case 2:
                        isValid = _a.sent();
                        if (!isValid)
                            return [2 /*return*/, null];
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        return [2 /*return*/, userWithoutPassword];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Login error:", error_1);
                        throw new Error("Erro ao realizar login");
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Usuários
    createUser: function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var hashedPassword;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcryptjs_1.default.hash(data.password, 10)];
                    case 1:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, prisma_1.prisma.user.create({
                                data: __assign(__assign({}, data), { password: hashedPassword }),
                                include: {
                                    companyInfo: true,
                                },
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    updateUser: function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.user.update({
                            where: { id: id },
                            data: data,
                            include: {
                                companyInfo: true,
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    createInitialUser: function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingAdmin, hashedPassword, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                            where: { email: "admin@example.com" },
                        })];
                    case 1:
                        existingAdmin = _a.sent();
                        if (!!existingAdmin) return [3 /*break*/, 4];
                        return [4 /*yield*/, bcryptjs_1.default.hash("admin123", 10)];
                    case 2:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, prisma_1.prisma.user.create({
                                data: {
                                    email: "admin@example.com",
                                    password: hashedPassword,
                                    companyInfo: {
                                        create: {
                                            name: "Mecânica Rocha",
                                            cnpj: "41.008.040/0001-67",
                                            address: "Rua Eliazar Braga o-416 - CENTRO",
                                            phone: "(14) 99650-2602",
                                            email: "mecanicarocha21@gmail.com",
                                        },
                                    },
                                },
                                include: {
                                    companyInfo: true,
                                },
                            })];
                    case 3:
                        user = _a.sent();
                        console.log("Admin user created:", user);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    // Informações da Empresa
    updateCompanyInfo: function (userId, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.companyInfo.upsert({
                            where: {
                                userId: userId,
                            },
                            update: data,
                            create: __assign(__assign({}, data), { user: {
                                    connect: { id: userId },
                                } }),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    // Ordens de Serviço
    createServiceOrder: function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.serviceOrder.create({
                            data: {
                                date: data.date,
                                client: data.client,
                                fleet: data.fleet,
                                farm: data.farm,
                                description: data.description,
                                total: data.total,
                                userId: data.userId,
                                items: {
                                    create: data.items.map(function (item) { return ({
                                        description: item.description,
                                        unitPrice: item.unitPrice,
                                        quantity: item.quantity,
                                        total: item.unitPrice * item.quantity,
                                    }); }),
                                },
                            },
                            include: {
                                items: true,
                                user: {
                                    include: {
                                        companyInfo: true,
                                    },
                                },
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    getServiceOrders: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.serviceOrder.findMany({
                            where: {
                                userId: userId,
                            },
                            include: {
                                items: true,
                                user: {
                                    include: {
                                        companyInfo: true,
                                    },
                                },
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    getServiceOrder: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.serviceOrder.findUnique({
                            where: { id: id },
                            include: {
                                items: true,
                                user: {
                                    include: {
                                        companyInfo: true,
                                    },
                                },
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    updateServiceOrderStatus: function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.prisma.serviceOrder.update({
                            where: { id: id },
                            data: { status: status },
                            include: {
                                items: true,
                            },
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    },
    // Dashboard Statistics
    getDashboardStats: function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, totalOrders, monthlyOrders, totalRevenue, uniqueClients;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            prisma_1.prisma.serviceOrder.count({
                                where: { userId: userId },
                            }),
                            prisma_1.prisma.serviceOrder.count({
                                where: {
                                    userId: userId,
                                    date: {
                                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                    },
                                },
                            }),
                            prisma_1.prisma.serviceOrder.aggregate({
                                where: { userId: userId },
                                _sum: {
                                    total: true,
                                },
                            }),
                        ])];
                    case 1:
                        _a = _c.sent(), totalOrders = _a[0], monthlyOrders = _a[1], totalRevenue = _a[2];
                        return [4 /*yield*/, prisma_1.prisma.serviceOrder.findMany({
                                where: { userId: userId },
                                select: { client: true },
                                distinct: ["client"],
                            })];
                    case 2:
                        uniqueClients = _c.sent();
                        return [2 /*return*/, {
                                totalOrders: totalOrders,
                                totalClientsServed: uniqueClients.length,
                                monthlyOrders: monthlyOrders,
                                totalRevenue: (_b = totalRevenue._sum.total) !== null && _b !== void 0 ? _b : 0,
                            }];
                }
            });
        });
    },
};
