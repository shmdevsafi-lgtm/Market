/**
 * Auth Page
 * Main authentication page with tabs for Registration and Login
 * Handles both user registration and login in a single page
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { RegistrationForm } from "../components/RegistrationForm";
import { LoginForm } from "../components/LoginForm";

export default function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegistrationSuccess = (token: string, user: any) => {
    // Do NOT store sensitive tokens in localStorage
    // Keep token only in memory via AuthContext
    login({ ...user, token });
    setSuccessMessage("Inscription réussie! Bienvenue!");
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const handleLoginSuccess = (token: string, user: any) => {
    // Do NOT store sensitive tokens in localStorage
    // Keep token only in memory via AuthContext
    login({ ...user, token });
    setSuccessMessage("Connexion réussie! Bienvenue!");
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">SHM</h1>
            <p className="text-gray-600 mt-2">Plateforme d'éducation et de commerce</p>
          </div>

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-600 text-sm">
              {successMessage}
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-0">
              <LoginForm
                onSuccess={handleLoginSuccess}
                onError={handleError}
              />
            </TabsContent>

            {/* Registration Tab */}
            <TabsContent value="register" className="space-y-0">
              <RegistrationForm
                onSuccess={handleRegistrationSuccess}
                onError={handleError}
              />
            </TabsContent>
          </Tabs>

          {/* Footer Note */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              En continuant, vous acceptez nos{" "}
              <a href="/privacy" className="text-blue-600 hover:underline">
                conditions d'utilisation
              </a>{" "}
              et notre{" "}
              <a href="/security" className="text-blue-600 hover:underline">
                politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
