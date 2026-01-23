import React, { useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, Plus } from "lucide-react";

export default function CleanupDashboard() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen yellow-brick-road">
      <div className="min-h-screen" style={{background: 'rgba(255, 255, 255, 0.9)'}}>
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white px-6 py-8 shadow-2xl glitter">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.3)'}}>
                  {user?.organization || 'Cleanup Crew'} Portal
                </h1>
                <p className="text-amber-100 text-lg">Welcome, {user?.full_name}!</p>
              </div>
              <Button onClick={logout} variant="outline" className="bg-white text-amber-700 hover:bg-amber-50 border-2 border-white font-bold">
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-4 border-amber-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-100">
                <CardTitle className="flex items-center gap-3 text-amber-700">
                  <AlertTriangle className="h-8 w-8" />
                  Post Sweep Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">Alert individuals about upcoming cleanup operations</p>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg text-lg py-6">
                  <Plus className="mr-2 h-6 w-6" />
                  Schedule New Sweep
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-blue-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-100">
                <CardTitle className="flex items-center gap-3 text-blue-700">
                  <Calendar className="h-8 w-8" />
                  Scheduled Sweeps
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">View and manage upcoming operations</p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-lg text-lg py-6">
                  View Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
