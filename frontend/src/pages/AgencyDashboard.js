import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AgencyDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [clients, setClients] = useState([]);
  const [hudReport, setHudReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filteredClients = clients.filter(c => 
    c.client_info.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.client_info.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen yellow-brick-road">
      <div className="min-h-screen" style={{background: 'rgba(255, 255, 255, 0.9)'}}>
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-8 shadow-2xl glitter">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.3)'}}>
                  {user?.organization || 'Agency'} Portal
                </h1>
                <p className="text-emerald-100 text-lg">Unified Case Management System</p>
              </div>
              <Button onClick={logout} variant="outline" className="bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-white font-bold">
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white border-4 border-emerald-300">
              <TabsTrigger value="clients" className="text-lg">All Clients ({clients.length})</TabsTrigger>
              <TabsTrigger value="hud" className="text-lg">HUD Reports & Grants</TabsTrigger>
            </TabsList>

            <TabsContent value="clients">
              <Card className="border-4 border-emerald-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-emerald-700">Unified Client Database</CardTitle>
                    <Badge className="bg-purple-500 text-white text-lg px-4 py-2">
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
                        className="border-2 border-emerald-300 pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <p className="text-center py-8">Loading unified database...</p>
                  ) : filteredClients.length === 0 ? (
                    <p className="text-center py-8 text-gray-600">No clients found</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredClients.map((client, idx) => (
                        <Card key={idx} className="border-2 border-gray-200 hover:border-emerald-400 transition-all">
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
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-gray-50 p-3 rounded">
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
                                  <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-400 text-sm">
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
                              
                              <Button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
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
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">HUD Compliance & Grant Reports</CardTitle>
                    <Button className="bg-white text-indigo-700 hover:bg-gray-100 font-bold">
                      <Download className="mr-2 h-5 w-5" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  {hudReport && (
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-4 gap-6">
                        <Card className="border-4 border-emerald-300 glitter">
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-emerald-600">{hudReport.total_clients}</p>
                            <p className="text-gray-700 font-semibold mt-2">Total Clients Served</p>
                            <p className="text-xs text-gray-500 mt-1">Point-in-Time Count</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-4 border-blue-300 glitter">
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-blue-600">{hudReport.veteran_clients}</p>
                            <p className="text-gray-700 font-semibold mt-2">Veterans</p>
                            <Badge className="mt-2 bg-blue-500">{hudReport.veteran_percentage}%</Badge>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-4 border-purple-300 glitter">
                          <CardContent className="pt-6 text-center">
                            <p className="text-5xl font-black text-purple-600">{hudReport.active_users_30_days}</p>
                            <p className="text-gray-700 font-semibold mt-2">Active (30 days)</p>
                            <Badge className="mt-2 bg-purple-500">{hudReport.engagement_rate}%</Badge>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-4 border-rose-300 glitter">
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
                            {Object.entries(hudReport.case_notes_by_category).map(([category, count]) => (
                              <div key={category} className="text-center p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-200">
                                <p className="text-3xl font-bold text-amber-600">{count}</p>
                                <p className="text-sm text-gray-700 capitalize font-semibold">{category}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-green-300">
                        <CardHeader className="bg-green-50">
                          <CardTitle>Data Quality (HUD Requirement)</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-bold mb-2">Report Information:</h4>
                              <div className="space-y-1 text-sm">
                                <div><strong>Organization:</strong> {hudReport.organization}</div>
                                <div><strong>Generated By:</strong> {hudReport.generated_by}</div>
                                <div><strong>Report Date:</strong> {new Date(hudReport.report_date).toLocaleString()}</div>
                                <div><strong>Reporting Period:</strong> {hudReport.reporting_period}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-bold mb-2">Data Completeness:</h4>
                              <div className="space-y-1 text-sm">
                                <div><strong>Complete Profiles:</strong> {hudReport.data_quality?.complete_profiles}</div>
                                <div><strong>Incomplete Profiles:</strong> {hudReport.data_quality?.incomplete_profiles}</div>
                                <div className="mt-2">
                                  <Badge className="bg-green-500 text-white text-lg">
                                    {hudReport.data_quality?.data_completeness_percentage}% Complete
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-indigo-300">
                        <CardHeader className="bg-indigo-50">
                          <CardTitle>Service Utilization Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div className="p-4 bg-indigo-50 rounded-lg">
                              <p className="text-4xl font-bold text-indigo-600">{hudReport.workbook_tasks_completed}</p>
                              <p className="text-sm text-gray-700 mt-2">Tasks Completed</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <p className="text-4xl font-bold text-purple-600">{hudReport.documents_stored}</p>
                              <p className="text-sm text-gray-700 mt-2">Documents Stored</p>
                            </div>
                            <div className="p-4 bg-pink-50 rounded-lg">
                              <p className="text-4xl font-bold text-pink-600">{hudReport.flashcard_completion_rate}%</p>
                              <p className="text-sm text-gray-700 mt-2">Intake Completion</p>
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
