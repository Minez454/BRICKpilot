import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Plus, MapPin, Clock, Star, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CleanupDashboard() {
  const { user, token, logout } = useContext(AuthContext);
  const [sweeps, setSweeps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    time: "",
    description: ""
  });

  useEffect(() => {
    loadSweeps();
  }, []);

  const loadSweeps = async () => {
    try {
      const res = await axios.get(`${API}/cleanup/sweeps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSweeps(res.data || []);
    } catch (error) {
      console.log("No sweeps endpoint yet");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/cleanup/sweeps`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Sweep schedule posted! Individuals will be notified.");
      setShowForm(false);
      setFormData({ location: "", date: "", time: "", description: "" });
      loadSweeps();
    } catch (error) {
      toast.error("Failed to post sweep schedule");
    }
  };

  return (
    <div className="min-h-screen yellow-brick-road" data-testid="cleanup-dashboard">
      <div className="min-h-screen" style={{background: 'rgba(255, 255, 255, 0.92)'}}>
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 glitter opacity-60"></div>
          <div className="container mx-auto relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-wide" style={{fontFamily: 'Cinzel, serif', textShadow: '3px 3px 6px rgba(0,0,0,0.3)'}}>
                      {user?.organization || 'Cleanup Crew'} Portal
                    </h1>
                    <p className="text-amber-100 text-lg">Welcome, {user?.full_name}!</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={logout} 
                variant="outline" 
                className="bg-white/90 text-amber-700 hover:bg-white border-2 border-white font-bold shadow-lg"
                data-testid="logout-btn"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Post New Sweep Card */}
            <Card className="border-4 border-amber-400 shadow-2xl overflow-hidden" data-testid="post-sweep-card">
              <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
              <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-100">
                <CardTitle className="flex items-center gap-3 text-amber-700" style={{fontFamily: 'Cinzel, serif'}}>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  Post Sweep Schedule
                </CardTitle>
                <CardDescription className="text-amber-600 font-medium">
                  Alert individuals about upcoming cleanup operations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {!showForm ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-6">
                      Posting a sweep alert helps unhoused individuals prepare and relocate their belongings safely.
                    </p>
                    <Button 
                      onClick={() => setShowForm(true)} 
                      className="btn-gold text-lg py-6 px-10"
                      data-testid="schedule-sweep-btn"
                    >
                      <Plus className="mr-2 h-6 w-6" />
                      Schedule New Sweep
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" data-testid="sweep-form">
                    <div>
                      <Label className="text-gray-700 font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        Location
                      </Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g., Fremont Street underpass near 4th St"
                        required
                        className="mt-2 border-2 border-amber-200 focus:border-amber-500"
                        data-testid="sweep-location-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-700 font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-amber-600" />
                          Date
                        </Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          required
                          className="mt-2 border-2 border-amber-200 focus:border-amber-500"
                          data-testid="sweep-date-input"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          Time
                        </Label>
                        <Input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          required
                          className="mt-2 border-2 border-amber-200 focus:border-amber-500"
                          data-testid="sweep-time-input"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-700 font-semibold">Additional Details</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Any additional information for those in the area..."
                        className="mt-2 border-2 border-amber-200 focus:border-amber-500"
                        rows={3}
                        data-testid="sweep-description-input"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        type="submit" 
                        className="flex-1 btn-emerald"
                        data-testid="submit-sweep-btn"
                      >
                        Post Alert
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowForm(false)}
                        className="border-2 border-gray-300"
                        data-testid="cancel-sweep-btn"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Sweeps Card */}
            <Card className="border-4 border-blue-400 shadow-2xl overflow-hidden" data-testid="scheduled-sweeps-card">
              <div className="h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardTitle className="flex items-center gap-3 text-blue-700" style={{fontFamily: 'Cinzel, serif'}}>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Scheduled Sweeps
                </CardTitle>
                <CardDescription className="text-blue-600 font-medium">
                  View and manage upcoming operations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading schedules...</div>
                ) : sweeps.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No sweeps scheduled yet</p>
                    <p className="text-sm text-gray-400 mt-2">Post a new sweep to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {sweeps.map((sweep, idx) => (
                      <div 
                        key={idx} 
                        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl"
                        data-testid={`sweep-item-${idx}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-amber-600" />
                              <span className="font-bold text-gray-800">{sweep.location}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {sweep.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {sweep.time}
                              </span>
                            </div>
                            {sweep.description && (
                              <p className="text-sm text-gray-500 mt-2">{sweep.description}</p>
                            )}
                          </div>
                          <Badge className="bg-amber-500 text-white">Scheduled</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Banner */}
          <Card className="mt-8 border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800 text-lg" style={{fontFamily: 'Cinzel, serif'}}>Why Post Sweep Alerts?</h3>
                  <p className="text-emerald-700 mt-1">
                    When you post a sweep schedule, BRICK notifies affected individuals through the app, 
                    giving them time to secure their belongings and find temporary shelter. This compassionate 
                    approach helps maintain public spaces while treating everyone with dignity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
