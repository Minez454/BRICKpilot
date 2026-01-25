import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Eye, Users, FileText, Calendar, TrendingUp, Star, Heart, Sun, Leaf } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Organization-specific themes
const getOrgTheme = (orgName) => {
  const themes = {
    "Shine-A-Light Las Vegas": {
      primary: "from-amber-500 via-yellow-500 to-amber-600",
      accent: "amber",
      icon: Sun,
      tagline: "Bringing Light to Those in Need",
      headerBg: "from-amber-500 via-yellow-500 to-orange-500"
    },
    "Recover Las Vegas": {
      primary: "from-teal-500 via-emerald-500 to-green-600",
      accent: "emerald",
      icon: Leaf,
      tagline: "Recovery. Restoration. Hope.",
      headerBg: "from-teal-500 via-emerald-500 to-green-600"
    },
    "HELP of Southern Nevada": {
      primary: "from-blue-500 via-indigo-500 to-purple-600",
      accent: "indigo",
      icon: Heart,
      tagline: "Helping People. Changing Lives.",
      headerBg: "from-blue-600 via-indigo-600 to-purple-600"
    },
    "Catholic Charities of Southern Nevada": {
      primary: "from-red-500 via-rose-500 to-red-600",
      accent: "rose",
      icon: Heart,
      tagline: "Serving Those in Need Since 1941",
      headerBg: "from-red-600 via-rose-600 to-red-700"
    },
    "Salvation Army Las Vegas": {
      primary: "from-red-600 via-red-500 to-orange-600",
      accent: "red",
      icon: Heart,
      tagline: "Doing the Most Good",
      headerBg: "from-red-700 via-red-600 to-orange-600"
    },
    "Nevada Partnership for Homeless Youth": {
      primary: "from-purple-500 via-violet-500 to-purple-600",
      accent: "purple",
      icon: Heart,
      tagline: "Supporting Youth. Building Futures.",
      headerBg: "from-purple-600 via-violet-600 to-purple-700"
    },
    "Veterans Village Las Vegas": {
      primary: "from-blue-600 via-blue-500 to-cyan-600",
      accent: "blue",
      icon: Star,
      tagline: "Serving Those Who Served",
      headerBg: "from-blue-700 via-blue-600 to-cyan-600"
    },
    "Shannon West Homeless Youth Center": {
      primary: "from-pink-500 via-rose-500 to-pink-600",
      accent: "pink",
      icon: Heart,
      tagline: "A Safe Place for Youth",
      headerBg: "from-pink-600 via-rose-600 to-pink-700"
    },
    "TRAC-B Harm Reduction": {
      primary: "from-orange-500 via-amber-500 to-orange-600",
      accent: "orange",
      icon: Heart,
      tagline: "Reducing Harm. Saving Lives.",
      headerBg: "from-orange-600 via-amber-600 to-orange-700"
    },
    "City of Las Vegas": {
      primary: "from-slate-600 via-gray-600 to-slate-700",
      accent: "slate",
      icon: Star,
      tagline: "Official City Homeless Services",
      headerBg: "from-slate-700 via-gray-700 to-slate-800"
    },
    "Clark County Social Services": {
      primary: "from-cyan-600 via-teal-600 to-cyan-700",
      accent: "cyan",
      icon: Star,
      tagline: "County-Wide Social Services",
      headerBg: "from-cyan-700 via-teal-700 to-cyan-800"
    },
    "H.E.L.P. of Southern Nevada": {
      primary: "from-blue-600 via-sky-500 to-blue-600",
      accent: "blue",
      icon: Heart,
      tagline: "Homeless Emergency Lodging Program",
      headerBg: "from-blue-700 via-sky-600 to-blue-700"
    },
    "The Courtyard Homeless Resource Center": {
      primary: "from-stone-600 via-amber-600 to-stone-700",
      accent: "stone",
      icon: Heart,
      tagline: "A Safe Place to Start Again",
      headerBg: "from-stone-700 via-amber-700 to-stone-800"
    },
    "default": {
      primary: "from-emerald-500 via-green-500 to-emerald-600",
      accent: "emerald",
      icon: Star,
      tagline: "Unified Case Management System",
      headerBg: "from-emerald-600 to-emerald-700"
    }
  };
  return themes[orgName] || themes.default;
};

export default function AgencyDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [hudReport, setHudReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const orgTheme = getOrgTheme(user?.organization);
  const OrgIcon = orgTheme.icon;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [clientsRes, hudRes] = await Promise.all([
        axios.get(`${API}/agency/clients/unified`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/caseworker/hud-report`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setClients(clientsRes.data.clients || []);
      setHudReport(hudRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const exportHUDCsv = async () => {
    try {
      toast.info("Generating HUD CSV export...");
      const res = await axios.get(`${API}/hmis/export/csv`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Convert base64 to blob and download
      const byteCharacters = atob(res.data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/zip' });
      
      // Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${res.data.filename} with ${res.data.files_included.length} CSV files!`);
    } catch (error) {
      toast.error("Failed to export HUD data");
    }
  };

  const filteredClients = clients.filter(c => 
    c.client_info.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_info.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate quick stats
  const activeClients = clients.filter(c => c.engagement.last_active).length;
  const veteranClients = clients.filter(c => c.client_info.is_veteran).length;
  const recentlyActive = clients.filter(c => {
    if (!c.engagement.last_active) return false;
    const lastActive = new Date(c.engagement.last_active);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return lastActive > weekAgo;
  }).length;

  return (
    <div className="min-h-screen yellow-brick-road" data-testid="agency-dashboard">
      <div className="min-h-screen" style={{background: 'rgba(255, 255, 255, 0.92)'}}>
        {/* Organization-Branded Header */}
        <div className={`bg-gradient-to-r ${orgTheme.headerBg} text-white px-6 py-8 shadow-2xl relative overflow-hidden`}>
          <div className="absolute inset-0 glitter opacity-50"></div>
          <div className="container mx-auto relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                    <OrgIcon className="h-9 w-9 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-wide" style={{fontFamily: 'Cinzel, serif', textShadow: '3px 3px 6px rgba(0,0,0,0.3)'}}>
                      {user?.organization || 'Agency'} Portal
                    </h1>
                    <p className="text-white/90 text-lg font-medium">{orgTheme.tagline}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm mb-2">{user?.full_name}</p>
                <Button 
                  onClick={logout} 
                  variant="outline" 
                  className="bg-white/90 text-gray-800 hover:bg-white border-2 border-white font-bold shadow-lg"
                  data-testid="logout-btn"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="container mx-auto px-6 -mt-6 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={`border-4 border-${orgTheme.accent}-400 shadow-xl bg-white`} data-testid="stat-total-clients">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${orgTheme.primary} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">{clients.length}</p>
                    <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-blue-400 shadow-xl bg-white" data-testid="stat-veterans">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">{veteranClients}</p>
                    <p className="text-sm text-gray-600 font-medium">Veterans</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-green-400 shadow-xl bg-white" data-testid="stat-active">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">{recentlyActive}</p>
                    <p className="text-sm text-gray-600 font-medium">Active (7 days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-purple-400 shadow-xl bg-white" data-testid="stat-reports">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">{hudReport?.users_with_case_files || 0}</p>
                    <p className="text-sm text-gray-600 font-medium">Case Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList className={`grid w-full grid-cols-2 bg-white border-4 border-${orgTheme.accent}-300 rounded-xl p-1`}>
              <TabsTrigger 
                value="clients" 
                className={`rounded-lg data-[state=active]:bg-${orgTheme.accent}-600 data-[state=active]:text-white font-semibold text-lg py-3`}
                data-testid="tab-clients"
              >
                <Users className="mr-2 h-5 w-5" />
                All Clients ({clients.length})
              </TabsTrigger>
              <TabsTrigger 
                value="hud" 
                className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-semibold text-lg py-3"
                data-testid="tab-hud"
              >
                <FileText className="mr-2 h-5 w-5" />
                HUD Reports & Grants
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients">
              <Card className={`border-4 border-${orgTheme.accent}-400 shadow-2xl`}>
                <CardHeader className={`bg-gradient-to-r from-${orgTheme.accent}-50 to-green-100`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`text-2xl text-${orgTheme.accent}-700`} style={{fontFamily: 'Cinzel, serif'}}>
                        Unified Client Database
                      </CardTitle>
                      <CardDescription>View clients across ALL partner agencies</CardDescription>
                    </div>
                    <Badge className="bg-purple-500 text-white text-sm px-4 py-2 font-bold">
                      Shared Across ALL Agencies
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search clients by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`border-2 border-${orgTheme.accent}-300 pl-10 rounded-xl`}
                        data-testid="search-clients-input"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading unified database...</p>
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No clients found</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {filteredClients.map((client, idx) => (
                        <Card key={idx} className="border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all" data-testid={`client-card-${idx}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-bold text-gray-800">
                                    {client.client_info.full_name}
                                  </h3>
                                  {client.client_info.is_veteran && (
                                    <Badge className="bg-blue-600 text-white">Veteran</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{client.client_info.email}</p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded-lg">
                                  <div>
                                    <span className="font-semibold text-emerald-600">Dossier:</span>
                                    <span className="ml-2">{client.engagement.dossier_entries} entries</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-purple-600">Documents:</span>
                                    <span className="ml-2">{client.engagement.documents_uploaded}</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-amber-600">Agencies:</span>
                                    <span className="ml-2">{client.inter_agency_data.agencies_served_by.length}</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-blue-600">Last Active:</span>
                                    <span className="ml-2">{client.engagement.last_active ? new Date(client.engagement.last_active).toLocaleDateString() : 'Never'}</span>
                                  </div>
                                </div>

                                {client.inter_agency_data.last_known_location !== "Not recorded" && (
                                  <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-400 text-sm rounded-r-lg">
                                    <strong className="text-amber-700">Last Known Location:</strong>
                                    <span className="ml-2">{client.inter_agency_data.last_known_location}</span>
                                  </div>
                                )}

                                {client.inter_agency_data.caseworker_notes_count > 0 && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    📝 {client.inter_agency_data.caseworker_notes_count} notes from other agencies
                                  </div>
                                )}
                              </div>
                              
                              <Button className={`bg-gradient-to-r ${orgTheme.primary} text-white shadow-lg`} data-testid={`view-history-btn-${idx}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Full History
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hud">
              <Card className="border-4 border-indigo-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl" style={{fontFamily: 'Cinzel, serif'}}>HUD Compliance & Grant Reports</CardTitle>
                      <CardDescription className="text-indigo-100">Generate reports for funding applications</CardDescription>
                    </div>
                    <Button onClick={exportHUDCsv} className="bg-white text-indigo-700 hover:bg-gray-100 font-bold shadow-lg" data-testid="export-report-btn">
                      <Download className="mr-2 h-5 w-5" />
                      Generate HUD CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  {hudReport && (
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-4 gap-6">
                        <Card className="border-4 border-emerald-300 glitter overflow-hidden">
                          <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-emerald-600">{hudReport.total_clients}</p>
                            <p className="text-gray-700 font-semibold mt-2">Total Clients Served</p>
                            <p className="text-xs text-gray-500 mt-1">Point-in-Time Count</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-4 border-blue-300 glitter overflow-hidden">
                          <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-blue-600">{hudReport.veteran_clients}</p>
                            <p className="text-gray-700 font-semibold mt-2">Veterans</p>
                            <Badge className="mt-2 bg-blue-500">{hudReport.veteran_percentage}%</Badge>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-4 border-purple-300 glitter overflow-hidden">
                          <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-purple-600">{hudReport.active_users_30_days}</p>
                            <p className="text-gray-700 font-semibold mt-2">Active (30 days)</p>
                            <Badge className="mt-2 bg-purple-500">{hudReport.engagement_rate}%</Badge>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-4 border-rose-300 glitter overflow-hidden">
                          <div className="h-1 bg-gradient-to-r from-rose-400 to-red-500"></div>
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-rose-600">{hudReport.users_with_case_files}</p>
                            <p className="text-gray-700 font-semibold mt-2">Complete Case Files</p>
                            <Badge className="mt-2 bg-rose-500">{hudReport.case_file_completion_rate}%</Badge>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-2 border-amber-300">
                        <CardHeader className="bg-amber-50">
                          <CardTitle>Service Categories (For Grant Applications)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-5 gap-4">
                            {Object.entries(hudReport.case_notes_by_category || {}).map(([category, count]) => (
                              <div key={category} className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-200">
                                <p className="text-3xl font-bold text-amber-600">{count}</p>
                                <p className="text-sm text-gray-700 capitalize font-semibold">{category}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-2 border-green-300">
                          <CardHeader className="bg-green-50">
                            <CardTitle>Data Quality (HUD Requirement)</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <span className="font-medium">Complete Profiles</span>
                                <span className="text-2xl font-bold text-green-600">{hudReport.data_quality?.complete_profiles}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <span className="font-medium">Incomplete Profiles</span>
                                <span className="text-2xl font-bold text-amber-600">{hudReport.data_quality?.incomplete_profiles}</span>
                              </div>
                              <div className="mt-4">
                                <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                                  {hudReport.data_quality?.data_completeness_percentage}% Data Complete
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-indigo-300">
                          <CardHeader className="bg-indigo-50">
                            <CardTitle>Report Information</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-2">
                            <div className="flex justify-between p-2 bg-white rounded">
                              <span className="text-gray-600">Organization:</span>
                              <span className="font-semibold">{hudReport.organization}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-white rounded">
                              <span className="text-gray-600">Generated By:</span>
                              <span className="font-semibold">{hudReport.generated_by}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-white rounded">
                              <span className="text-gray-600">Report Date:</span>
                              <span className="font-semibold">{new Date(hudReport.report_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-white rounded">
                              <span className="text-gray-600">Period:</span>
                              <span className="font-semibold">{hudReport.reporting_period}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-2 border-pink-300">
                        <CardHeader className="bg-pink-50">
                          <CardTitle>Service Utilization Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200">
                              <p className="text-4xl font-bold text-indigo-600">{hudReport.workbook_tasks_completed}</p>
                              <p className="text-sm text-gray-700 mt-2 font-medium">Tasks Completed</p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                              <p className="text-4xl font-bold text-purple-600">{hudReport.documents_stored}</p>
                              <p className="text-sm text-gray-700 mt-2 font-medium">Documents Stored</p>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200">
                              <p className="text-4xl font-bold text-pink-600">{hudReport.flashcard_completion_rate}%</p>
                              <p className="text-sm text-gray-700 mt-2 font-medium">Intake Completion</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
