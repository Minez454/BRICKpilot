import React, { useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, MapPin, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgencyDashboard() {
  const { user, logout } = useContext(AuthContext);

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
                <p className="text-emerald-100 text-lg">Welcome, {user?.full_name}!</p>
              </div>
              <Button onClick={logout} variant="outline" className="bg-white text-emerald-700 hover:bg-emerald-50 border-2 border-white font-bold">
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-4 border-emerald-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-green-100">
                <CardTitle className="flex items-center gap-3 text-emerald-700">
                  <Calendar className="h-8 w-8" />
                  Pop-Up Events
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">Post mobile clinics, food drives, and temporary services</p>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Event
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-amber-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-amber-50 to-yellow-100">
                <CardTitle className="flex items-center gap-3 text-amber-700">
                  <MapPin className="h-8 w-8" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">Manage your organization's service locations</p>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-lg">
                  Manage Resources
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-rose-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-rose-50 to-pink-100">
                <CardTitle className="flex items-center gap-3 text-rose-700">
                  <Users className="h-8 w-8" />
                  Unified Client Database
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">View ALL clients across ALL agencies</p>
                <Button className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-lg">
                  View Clients
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
