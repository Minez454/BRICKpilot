import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Scale, FileText, Download, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LegalAid() {
  const { user, token, logout } = useContext(AuthContext);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const res = await axios.get(`${API}/legal/forms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(res.data);
    } catch (error) {
      toast.error("Failed to load legal forms");
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    court: "bg-amber-100 text-amber-700",
    housing: "bg-purple-100 text-purple-700",
    safety: "bg-rose-100 text-rose-700",
    personal: "bg-blue-100 text-blue-700"
  };

  const groupedForms = forms.reduce((acc, form) => {
    if (!acc[form.category]) acc[form.category] = [];
    acc[form.category].push(form);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" data-testid="legal-aid-page">
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
                <Button onClick={() => navigate("/legal")} variant="ghost" className="w-full justify-start bg-amber-50">Legal Aid</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start">My Dossier</Button>
                <hr />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-xl font-bold text-gray-800" data-testid="page-title">Legal Aid & Advocacy</h1>
            <p className="text-xs text-gray-500">Forms, guides, and resources</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="oz-card border-amber-200 mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Scale className="h-8 w-8 text-amber-600" />
                <div>
                  <CardTitle className="text-amber-700">Know Your Rights</CardTitle>
                  <CardDescription>
                    Access legal forms, step-by-step guides, and pro bono resources. 
                    <span className="text-rose-600 font-medium"> BRICK provides guidance, not legal advice.</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="forms" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="forms" data-testid="tab-forms">Legal Forms</TabsTrigger>
              <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forms" className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading forms...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedForms).map(([category, categoryForms]) => (
                    <div key={category}>
                      <h2 className="text-lg font-bold capitalize mb-4 flex items-center gap-2">
                        <Badge className={categoryColors[category] || "bg-gray-100 text-gray-700"}>
                          {category}
                        </Badge>
                      </h2>
                      <div className="grid gap-4">
                        {categoryForms.map(form => (
                          <Card key={form.id} className="border-2" data-testid={`form-card-${form.id}`}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base mb-2">{form.title}</CardTitle>
                                  <CardDescription className="text-sm">{form.description}</CardDescription>
                                </div>
                                <Button size="icon" variant="outline" className="text-amber-600" data-testid={`download-form-btn-${form.id}`}>
                                  <Download className="h-5 w-5" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-2 mb-2">
                                  <BookOpen className="h-5 w-5 text-amber-600 mt-0.5" />
                                  <p className="text-sm font-medium text-amber-900">How to Use:</p>
                                </div>
                                <p className="text-sm text-amber-800 ml-7">{form.instructions}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="mt-6">
              <div className="space-y-4">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base">Legal Aid Center of Southern Nevada</CardTitle>
                    <CardDescription>Free legal services for low-income individuals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">725 E Charleston Blvd, Las Vegas, NV 89104</p>
                    <p className="text-sm text-emerald-600 font-medium">(702) 386-1070</p>
                    <p className="text-xs text-gray-500 mt-2">Mon-Fri 8:30am-5pm</p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base">Clark County Self-Help Center</CardTitle>
                    <CardDescription>Free assistance with court forms and procedures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-2">200 Lewis Ave, Las Vegas, NV 89155</p>
                    <p className="text-sm text-emerald-600 font-medium">(702) 671-4600</p>
                    <p className="text-xs text-gray-500 mt-2">Mon-Fri 8am-4pm</p>
                  </CardContent>
                </Card>

                <Card className="border-2 bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-900">Need Legal Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-800 mb-4">
                      Ask BRICK for guidance on your specific legal situation. I can help you understand your options and direct you to the right resources.
                    </p>
                    <Button onClick={() => navigate("/brick")} className="btn-emerald">
                      Talk to BRICK
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
