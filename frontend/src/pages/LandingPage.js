import React, { useState, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { toast } from "sonner";
import { Sparkles, Heart, Shield, BookOpen, Map, Scale } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      const res = await axios.post(`${API}/auth/register`, {
        email: formData.get("email"),
        password: formData.get("password"),
        full_name: formData.get("full_name"),
        phone: formData.get("phone") || null,
        is_veteran: formData.get("is_veteran") === "on"
      });
      
      login(res.data.access_token, res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: formData.get("email"),
        password: formData.get("password")
      });
      
      login(res.data.access_token, res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen oz-gradient relative overflow-hidden">
      {/* Decorative sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="sparkle absolute top-20 left-10 w-3 h-3 bg-yellow-300 rounded-full"></div>
        <div className="sparkle absolute top-40 right-20 w-2 h-2 bg-pink-300 rounded-full" style={{animationDelay: '0.5s'}}></div>
        <div className="sparkle absolute bottom-32 left-1/4 w-4 h-4 bg-emerald-300 rounded-full" style={{animationDelay: '1s'}}></div>
        <div className="sparkle absolute top-1/3 right-1/3 w-2 h-2 bg-purple-300 rounded-full" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 drop-shadow-2xl" data-testid="landing-hero-title">
            <span className="inline-block" style={{textShadow: '3px 3px 0px rgba(0,0,0,0.2)'}}>BRICK</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/95 mb-4 font-medium" data-testid="landing-subtitle">
            Your AI Caseworker on the Journey Home
          </p>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto">
            Navigate Las Vegas resources, store vital documents securely, and build your path to stability
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="oz-card border-emerald-200" data-testid="feature-card-ai">
            <CardHeader>
              <Sparkles className="w-12 h-12 text-emerald-600 mb-2" />
              <CardTitle className="text-emerald-700">BRICK AI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Trauma-responsive AI that learns your story and guides your journey</p>
            </CardContent>
          </Card>

          <Card className="oz-card border-rose-200" data-testid="feature-card-resources">
            <CardHeader>
              <Map className="w-12 h-12 text-rose-600 mb-2" />
              <CardTitle className="text-rose-700">Live Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Real-time map of shelters, food banks, and services in Las Vegas</p>
            </CardContent>
          </Card>

          <Card className="oz-card border-purple-200" data-testid="feature-card-vault">
            <CardHeader>
              <Shield className="w-12 h-12 text-purple-600 mb-2" />
              <CardTitle className="text-purple-700">The Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Secure storage for DD-214, IDs, and vital documents</p>
            </CardContent>
          </Card>

          <Card className="oz-card border-blue-200" data-testid="feature-card-workbook">
            <CardHeader>
              <BookOpen className="w-12 h-12 text-blue-600 mb-2" />
              <CardTitle className="text-blue-700">Workbook</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Personalized tasks and challenges to build life skills</p>
            </CardContent>
          </Card>

          <Card className="oz-card border-amber-200" data-testid="feature-card-legal">
            <CardHeader>
              <Scale className="w-12 h-12 text-amber-600 mb-2" />
              <CardTitle className="text-amber-700">Legal Aid</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Forms, guides, and resources for navigating the court system</p>
            </CardContent>
          </Card>

          <Card className="oz-card border-pink-200" data-testid="feature-card-dossier">
            <CardHeader>
              <Heart className="w-12 h-12 text-pink-600 mb-2" />
              <CardTitle className="text-pink-700">Your Dossier</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">Unified case history so you never repeat your story</p>
            </CardContent>
          </Card>
        </div>

        {/* Auth Card */}
        <div className="max-w-md mx-auto">
          <Card className="oz-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-gray-800">Get Started</CardTitle>
              <CardDescription className="text-center">Begin your journey with BRICK</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" data-testid="auth-tabs">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" name="email" type="email" required data-testid="login-email-input" />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input id="login-password" name="password" type="password" required data-testid="login-password-input" />
                    </div>
                    <Button type="submit" className="w-full btn-emerald" disabled={loading} data-testid="login-submit-btn">
                      {loading ? "Loading..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                    <div>
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input id="reg-name" name="full_name" required data-testid="register-name-input" />
                    </div>
                    <div>
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" name="email" type="email" required data-testid="register-email-input" />
                    </div>
                    <div>
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" name="password" type="password" required data-testid="register-password-input" />
                    </div>
                    <div>
                      <Label htmlFor="reg-phone">Phone (Optional)</Label>
                      <Input id="reg-phone" name="phone" type="tel" data-testid="register-phone-input" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="veteran" name="is_veteran" data-testid="register-veteran-checkbox" />
                      <Label htmlFor="veteran" className="text-sm">I am a veteran</Label>
                    </div>
                    <Button type="submit" className="w-full btn-emerald" disabled={loading} data-testid="register-submit-btn">
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
