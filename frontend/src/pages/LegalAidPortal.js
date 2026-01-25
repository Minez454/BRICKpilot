import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Users, MessageSquare, FileText, Search, Star, Calendar, Clock } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LegalAidPortal() {
  const { user, token, logout } = useContext(AuthContext);
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await axios.get(`${API}/legal/cases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCases(res.data || []);
    } catch (error) {
      console.log("Legal cases endpoint pending");
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen yellow-brick-road" data-testid="legal-aid-portal">
      <div className="min-h-screen" style={{background: 'rgba(255, 255, 255, 0.92)'}}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white px-6 py-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 glitter opacity-60"></div>
          <div className="container mx-auto relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-wide" style={{fontFamily: 'Cinzel, serif', textShadow: '3px 3px 6px rgba(0,0,0,0.3)'}}>
                      Legal Aid Portal
                    </h1>
                    <p className="text-indigo-200 text-lg">{user?.full_name} • {user?.organization || 'Pro Bono Legal Services'}</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="bg-white/90 text-indigo-700 hover:bg-white border-2 border-white font-bold shadow-lg"
                data-testid="logout-btn"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-6 -mt-6 relative z-20">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-4 border-indigo-400 shadow-2xl overflow-hidden" data-testid="active-cases-card">
              <div className="h-2 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-indigo-600">{cases.length || 0}</p>
                    <p className="text-gray-600 font-semibold">Active Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-purple-400 shadow-2xl overflow-hidden" data-testid="consultations-card">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-500"></div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-purple-600">0</p>
                    <p className="text-gray-600 font-semibold">Pending Consultations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-rose-400 shadow-2xl overflow-hidden" data-testid="forms-card">
              <div className="h-2 bg-gradient-to-r from-rose-400 to-red-500"></div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-4xl font-black text-rose-600">0</p>
                    <p className="text-gray-600 font-semibold">Forms to Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-10">
          <Tabs defaultValue="cases" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white border-4 border-indigo-300 rounded-xl p-1">
              <TabsTrigger 
                value="cases" 
                className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-semibold text-lg py-3"
                data-testid="tab-cases"
              >
                <Users className="mr-2 h-5 w-5" />
                Client Cases
              </TabsTrigger>
              <TabsTrigger 
                value="consultations" 
                className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold text-lg py-3"
                data-testid="tab-consultations"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Consultations
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="rounded-lg data-[state=active]:bg-rose-600 data-[state=active]:text-white font-semibold text-lg py-3"
                data-testid="tab-resources"
              >
                <Scale className="mr-2 h-5 w-5" />
                Legal Resources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cases">
              <Card className="border-4 border-indigo-300 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-indigo-700 text-2xl" style={{fontFamily: 'Cinzel, serif'}}>
                        Client Cases
                      </CardTitle>
                      <CardDescription>Manage and assist individuals with legal matters</CardDescription>
                    </div>
                    <div className="relative w-80">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 border-indigo-200"
                        data-testid="search-cases-input"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading cases...</div>
                  ) : filteredCases.length === 0 ? (
                    <div className="text-center py-12">
                      <Scale className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Cases</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        When BRICK users request legal assistance, their cases will appear here. 
                        You can view their dossier, assist with forms, and provide guidance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCases.map((caseItem, idx) => (
                        <Card key={idx} className="border-2 border-gray-200 hover:border-indigo-400 transition-all">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-gray-800">{caseItem.client_name}</h3>
                                <p className="text-sm text-gray-600">{caseItem.case_type}</p>
                              </div>
                              <Badge className="bg-indigo-500 text-white">{caseItem.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consultations">
              <Card className="border-4 border-purple-300 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-purple-700 text-2xl" style={{fontFamily: 'Cinzel, serif'}}>
                    Consultation Requests
                  </CardTitle>
                  <CardDescription>Users requesting legal guidance through BRICK</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Requests</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      When users ask BRICK about legal matters, they can request a consultation with a 
                      real legal professional. Those requests will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources">
              <Card className="border-4 border-rose-300 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50">
                  <CardTitle className="text-rose-700 text-2xl" style={{fontFamily: 'Cinzel, serif'}}>
                    Legal Resources Library
                  </CardTitle>
                  <CardDescription>Forms, guides, and resources for common legal issues</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Eviction Defense Forms", desc: "Answer forms and motions for unlawful detainer" },
                      { title: "ID Recovery Guide", desc: "Steps to replace lost Nevada ID and birth certificate" },
                      { title: "Record Expungement", desc: "Forms for sealing criminal records in Clark County" },
                      { title: "Civil Rights Complaints", desc: "Templates for discrimination complaints" },
                      { title: "VA Benefits Appeals", desc: "Forms for appealing denied veteran benefits" },
                      { title: "Public Benefits", desc: "SNAP, Medicaid, and SSI application guides" }
                    ].map((resource, idx) => (
                      <Card key={idx} className="border-2 border-gray-200 hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{resource.title}</h4>
                              <p className="text-sm text-gray-600">{resource.desc}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Pro Bono Workshops Banner */}
          <Card className="mt-8 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-800 text-lg" style={{fontFamily: 'Cinzel, serif'}}>
                    Pro Bono Workshop Calendar
                  </h3>
                  <p className="text-amber-700 mt-1">
                    Schedule and promote free legal clinics. BRICK will notify users about upcoming workshops 
                    and help them prepare necessary documents in advance.
                  </p>
                </div>
                <Button className="btn-gold">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Workshop
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
