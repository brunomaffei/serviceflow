import { ArrowLeft, Camera, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InputMask from "react-input-mask";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { DefaultLogo } from "../components/DefaultLogo";
import { Header } from "../components/Header";
import type { User } from "../types/ServiceOrder";

export function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editableCompanyInfo, setEditableCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(currentUser);
      setUser(userData);

      try {
        const companyData = await apiClient.getCompanyInfo(userData.id);
        console.log(companyData, "@@COMPANY");
        setCompanyInfo(companyData);
      } catch (error) {
        console.error("Error loading company info:", error);
        setMessage("Erro ao carregar informações da empresa");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handlePasswordChange = () => {
    if (!user || !newPassword) {
      setMessage("Por favor, insira uma nova senha.");
      setMessageType("error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUsers = users.map((u: User) =>
      u.id === user.id ? { ...u, password: newPassword } : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ ...user, password: newPassword })
    );
    setMessage("Senha alterada com sucesso!");
    setMessageType("success");
    setNewPassword("");
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Por favor, selecione apenas arquivos de imagem.");
      setMessageType("error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      localStorage.setItem("companyLogo", base64String);
      setMessage("Logo atualizado com sucesso!");
      setMessageType("success");
      // Force a re-render of the whole app
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Se estiver salvando
      handleSaveCompanyInfo();
    }
    setEditMode(!editMode);
  };

  const handleSaveCompanyInfo = async () => {
    if (!user) return;

    try {
      const { companyInfo: updatedInfo } = await apiClient.updateCompanyInfo(
        user.id,
        editableCompanyInfo
      );

      // Atualizar ambos os estados com os dados mais recentes
      setCompanyInfo(updatedInfo);
      setEditableCompanyInfo(updatedInfo);

      // Atualizar o usuário no localStorage com as novas informações
      const updatedUser = { ...user, companyInfo: updatedInfo };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setEditMode(false);
      setMessage("Informações atualizadas com sucesso!");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating company info:", error);
      setMessage("Erro ao atualizar informações");
      setMessageType("error");
    }
  };

  useEffect(() => {
    if (companyInfo) {
      setEditableCompanyInfo(companyInfo);
    }
  }, [companyInfo]);

  if (!user || loading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Configurações
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Dashboard
          </button>
        </div>

        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-6">
                Logo da Empresa
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {localStorage.getItem("companyLogo") ? (
                    <img
                      src={localStorage.getItem("companyLogo")!}
                      alt="Company Logo"
                      className="w-32 h-32 object-contain border rounded-lg bg-gray-50 dark:bg-gray-800"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400">
                      <div className="w-20 h-20">
                        <DefaultLogo />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar Logo
                  </button>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Recomendado: PNG ou JPG, tamanho máximo de 1MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info Section */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Informações da Empresa
                </h3>
                <button
                  onClick={handleEditToggle}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  {editMode ? "Salvar" : "Editar"}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={
                      editMode
                        ? editableCompanyInfo?.name || ""
                        : companyInfo?.name || ""
                    }
                    onChange={(e) =>
                      editMode &&
                      setEditableCompanyInfo({
                        ...editableCompanyInfo,
                        name: e.target.value,
                      })
                    }
                    readOnly={!editMode}
                    className={`mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base ${
                      !editMode && "bg-gray-50 dark:bg-gray-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={
                      editMode
                        ? editableCompanyInfo?.cnpj || ""
                        : companyInfo?.cnpj || ""
                    }
                    onChange={(e) =>
                      editMode &&
                      setEditableCompanyInfo({
                        ...editableCompanyInfo,
                        cnpj: e.target.value,
                      })
                    }
                    readOnly={!editMode}
                    className={`mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base ${
                      !editMode && "bg-gray-50 dark:bg-gray-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Telefone
                  </label>
                  <InputMask
                    type="text"
                    mask="(99) 99999-9999"
                    maskChar={null}
                    value={
                      editMode
                        ? editableCompanyInfo?.phone || ""
                        : companyInfo?.phone || ""
                    }
                    onChange={(e) =>
                      editMode &&
                      setEditableCompanyInfo({
                        ...editableCompanyInfo,
                        phone: e.target.value,
                      })
                    }
                    readOnly={!editMode}
                    className={`mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base ${
                      !editMode && "bg-gray-50 dark:bg-gray-700"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={
                      editMode
                        ? editableCompanyInfo?.address || ""
                        : companyInfo?.address || ""
                    }
                    onChange={(e) =>
                      editMode &&
                      setEditableCompanyInfo({
                        ...editableCompanyInfo,
                        address: e.target.value,
                      })
                    }
                    readOnly={!editMode}
                    className={`mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base ${
                      !editMode && "bg-gray-50 dark:bg-gray-700"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Alterar Senha
              </h3>
              {message && (
                <div
                  className={`mb-4 p-4 rounded-md ${
                    messageType === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {message}
                </div>
              )}
              <div className="max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full h-12 px-4 rounded-none border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
