import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { toast } from "sonner";
import { Sparkles, Heart, Shield, BookOpen, Map, Scale, Star, ArrowDown } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const authCardRef = useRef(null);

  const scrollToRegister = () => {
    setActiveTab("register");
    authCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

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
    <div className="min-h-screen oz-gradient relative overflow-hidden" data-testid="landing-page">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Sparkles */}
        <div className="absolute top-[10%] left-[5%] w-4 h-4 rounded-full bg-yellow-300 float" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-[20%] right-[10%] w-3 h-3 rounded-full bg-pink-400 float" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-[40%] left-[15%] w-5 h-5 rounded-full bg-purple-400 float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-[60%] right-[20%] w-4 h-4 rounded-full bg-yellow-200 float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-[75%] left-[8%] w-3 h-3 rounded-full bg-rose-300 float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-[30%] right-[5%] w-6 h-6 rounded-full bg-amber-300 float" style={{animationDelay: '2.5s'}}></div>
        
        {/* Glitter Overlay */}
        <div className="absolute inset-0 glitter opacity-70"></div>
        
        {/* Yellow Brick Road Path */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[200%] h-40 yellow-brick-road opacity-30 blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-16">
          {/* Ruby Slippers Icon */}
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <Star className="w-8 h-8 text-yellow-300 absolute -top-4 -left-4 animate-pulse" />
              <Star className="w-6 h-6 text-pink-300 absolute -top-2 -right-3 animate-pulse" style={{animationDelay: '0.3s'}} />
              <Star className="w-5 h-5 text-purple-300 absolute -bottom-2 -left-2 animate-pulse" style={{animationDelay: '0.6s'}} />
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 tracking-tight" data-testid="landing-hero-title">
            <span 
              className="inline-block gold-text drop-shadow-2xl"
              style={{
                textShadow: '4px 4px 0px rgba(0,0,0,0.3), 0 0 40px rgba(251, 191, 36, 0.5)'
              }}
            >
              BRICK
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl lg:text-3xl text-yellow-100 mb-4 font-semibold tracking-wide" data-testid="landing-subtitle" style={{fontFamily: 'Cinzel, serif'}}>
            Your AI Caseworker on the Journey Home
          </p>
          
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Follow the yellow brick road to stability. Navigate Las Vegas resources, 
            store vital documents securely, and build your path home.
          </p>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center mt-8 gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-yellow-400"></div>
            <Star className="w-4 h-4 text-yellow-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-yellow-400"></div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
          <div className="feature-card group" data-testid="feature-card-ai">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg emerald-glow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-emerald-700 mb-2" style={{fontFamily: 'Cinzel, serif'}}>BRICK AI</h3>
            <p className="text-gray-600 leading-relaxed">Trauma-responsive AI that learns your story and guides your journey with empathy</p>
          </div>

          <div className="feature-card group" data-testid="feature-card-resources">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg ruby-glow">
                <Map className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <Map className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-rose-700 mb-2" style={{fontFamily: 'Cinzel, serif'}}>Live Resources</h3>
            <p className="text-gray-600 leading-relaxed">Real-time map of shelters, food banks, and services throughout Las Vegas</p>
          </div>

          <div className="feature-card group" data-testid="feature-card-vault">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-purple-700 mb-2" style={{fontFamily: 'Cinzel, serif'}}>The Vault</h3>
            <p className="text-gray-600 leading-relaxed">Secure encrypted storage for DD-214, IDs, and vital documents</p>
          </div>

          <div className="feature-card group" data-testid="feature-card-workbook">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-blue-700 mb-2" style={{fontFamily: 'Cinzel, serif'}}>Workbook</h3>
            <p className="text-gray-600 leading-relaxed">Personalized tasks and challenges to build life skills step by step</p>
          </div>

          <div className="feature-card group" data-testid="feature-card-legal">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <Scale className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-700 mb-2" style={{fontFamily: 'Cinzel, serif'}}>Legal Aid</h3>
            <p className="text-gray-600 leading-relaxed">Forms, guides, and resources for navigating the court system</p>
          </div>

          <div className="feature-card group" data-testid="feature-card-dossier">
            <div className="relative">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg ruby-glow">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-pink-700 mb-2" style={{fontFamily: 'Cinzel, serif'}}>Your Dossier</h3>
            <p className="text-gray-600 leading-relaxed">Unified case history so you never have to repeat your story</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="max-w-md mx-auto">
          <Card className="bg-white/95 backdrop-blur-xl border-2 border-yellow-400/50 shadow-2xl overflow-hidden" data-testid="auth-card">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500"></div>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl emerald-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-800" style={{fontFamily: 'Cinzel, serif'}}>Begin Your Journey</CardTitle>
              <CardDescription className="text-gray-600">Step onto the yellow brick road</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="login" data-testid="auth-tabs">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-emerald-50 p-1 rounded-full">
                  <TabsTrigger 
                    value="login" 
                    className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold transition-all"
                    data-testid="tab-login"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="rounded-full data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold transition-all"
                    data-testid="tab-register"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                    <div>
                      <Label htmlFor="login-email" className="text-gray-700 font-medium">Email</Label>
                      <Input 
                        id="login-email" 
                        name="email" 
                        type="email" 
                        required 
                        className="mt-1 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        data-testid="login-email-input" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password" className="text-gray-700 font-medium">Password</Label>
                      <Input 
                        id="login-password" 
                        name="password" 
                        type="password" 
                        required 
                        className="mt-1 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        data-testid="login-password-input" 
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-emerald text-lg py-6" 
                      disabled={loading} 
                      data-testid="login-submit-btn"
                    >
                      {loading ? "Opening the gates..." : "Enter the Emerald City"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                    <div>
                      <Label htmlFor="reg-name" className="text-gray-700 font-medium">Full Name</Label>
                      <Input 
                        id="reg-name" 
                        name="full_name" 
                        required 
                        className="mt-1 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        data-testid="register-name-input" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-email" className="text-gray-700 font-medium">Email</Label>
                      <Input 
                        id="reg-email" 
                        name="email" 
                        type="email" 
                        required 
                        className="mt-1 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        data-testid="register-email-input" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-password" className="text-gray-700 font-medium">Password</Label>
                      <Input 
                        id="reg-password" 
                        name="password" 
                        type="password" 
                        required 
                        className="mt-1 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        data-testid="register-password-input" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="reg-phone" className="text-gray-700 font-medium">Phone (Optional)</Label>
                      <Input 
                        id="reg-phone" 
                        name="phone" 
                        type="tel" 
                        className="mt-1 border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                        data-testid="register-phone-input" 
                      />
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <Checkbox id="veteran" name="is_veteran" data-testid="register-veteran-checkbox" />
                      <Label htmlFor="veteran" className="text-sm text-blue-800 font-medium cursor-pointer">
                        I am a veteran (unlocks additional resources)
                      </Label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full btn-emerald text-lg py-6" 
                      disabled={loading} 
                      data-testid="register-submit-btn"
                    >
                      {loading ? "Creating your journey..." : "Start Your Journey"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Bottom Tagline */}
          <p className="text-center text-emerald-100/80 mt-8 text-sm">
            "There's no place like home" — Let us help you find yours.
          </p>
        </div>
      </div>
    </div>
  );
}
