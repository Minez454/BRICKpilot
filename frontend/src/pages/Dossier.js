import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Heart, Home, Scale, Briefcase, Heart as HeartPulse, FileText, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dossier() {
  const { user, token, logout } = useContext(AuthContext);
  const [dossierItems, setDossierItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDossier();
  }, []);

  const loadDossier = async () => {
    try {
      const res = await axios.get(`${API}/dossier`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDossierItems(res.data);
    } catch (error) {
      toast.error("Failed to load dossier");
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    housing: Home,
    legal: Scale,
    health: HeartPulse,
    employment: Briefcase,
    benefits: FileText
  };

  const categoryColors = {
    housing: "bg-purple-100 text-purple-700 border-purple-300",
    legal: "bg-amber-100 text-amber-700 border-amber-300",
    health: "bg-rose-100 text-rose-700 border-rose-300",
    employment: "bg-blue-100 text-blue-700 border-blue-300",
    benefits: "bg-emerald-100 text-emerald-700 border-emerald-300"
  };

  const groupedDossier = dossierItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" data-testid="dossier-page">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="menu-button">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="text-2xl font-bold text-emerald-700 mb-6">BRICK Menu</SheetTitle>
              <div className="space-y-3">
                <Button onClick={() => navigate("/brick")} variant="ghost" className="w-full justify-start">BRICK AI</Button>
                <Button onClick={() => navigate("/resources")} variant="ghost" className="w-full justify-start">Resources Map</Button>
                <Button onClick={() => navigate("/vault")} variant="ghost" className="w-full justify-start">The Vault</Button>
                <Button onClick={() => navigate("/workbook")} variant="ghost" className="w-full justify-start">My Workbook</Button>
                <Button onClick={() => navigate("/legal")} variant="ghost" className="w-full justify-start">Legal Aid</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start bg-pink-50">My Dossier</Button>
                <hr />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-xl font-bold text-gray-800" data-testid="page-title">My Dossier</h1>
            <p className="text-xs text-gray-500">Your unified case history</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="oz-card border-pink-200 mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-pink-600" />
                <div>
                  <CardTitle className="text-pink-700">Your Story, Organized</CardTitle>
                  <p className="text-sm text-gray-600">
                    BRICK automatically builds your dossier as you chat. Share it with caseworkers so you never have to repeat your story.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your dossier...</p>
            </div>
          ) : dossierItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Dossier is Empty</h3>
              <p className="text-gray-600 mb-6">
                Start chatting with BRICK! As you share your story, we'll automatically organize key information here.
              </p>
              <Button onClick={() => navigate("/brick")} className="btn-emerald">
                Talk to BRICK
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedDossier).map(([category, items]) => {
                const Icon = categoryIcons[category] || FileText;
                const colorClass = categoryColors[category] || "bg-gray-100 text-gray-700 border-gray-300";
                
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <Icon className="h-6 w-6 text-gray-700" />
                      <h2 className="text-xl font-bold capitalize">{category}</h2>
                      <Badge variant="secondary">{items.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {items.map(item => (
                        <Card key={item.id} className={`border-2 ${colorClass}`} data-testid={`dossier-item-${item.id}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{item.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {item.source}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 mb-2">{item.content}</p>
                            <p className="text-xs text-gray-500">
                              Added: {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
