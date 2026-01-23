import React, { useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LegalAidPortal() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const isLawyer = user?.full_name?.includes("Esq.");

  return (
    <div className="min-h-screen yellow-brick-road">
      <div className="min-h-screen" style={{background: 'rgba(255, 255, 255, 0.85)'}}>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-8 shadow-2xl glitter">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.3)'}}>
                  Legal Aid Portal
                </h1>
                <p className="text-indigo-100 text-lg">
                  {isLawyer ? 'Pro Bono Attorney' : 'Paralegal'} - {user?.full_name}
                </p>
              </div>
              <Button onClick={logout} variant="outline" className="bg-white text-indigo-700 hover:bg-indigo-50 border-2 border-white font-bold">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-4 border-indigo-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-indigo-50 to-purple-100">
                <CardTitle className="flex items-center gap-3 text-indigo-700">
                  <Users className="h-8 w-8" />
                  Active Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-5xl font-black text-indigo-600 mb-2">0</p>
                <p className="text-gray-600">Clients needing help</p>
              </CardContent>
            </Card>

            <Card className="border-4 border-purple-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-100">
                <CardTitle className="flex items-center gap-3 text-purple-700">
                  <MessageSquare className="h-8 w-8" />
                  Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">Chat with clients about their legal issues</p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg">
                  View Requests
                </Button>
              </CardContent>
            </Card>

            <Card className="border-4 border-rose-400 shadow-2xl hover:scale-105 transition-transform glitter">
              <CardHeader className="bg-gradient-to-br from-rose-50 to-red-100">
                <CardTitle className="flex items-center gap-3 text-rose-700">
                  <FileText className="h-8 w-8" />
                  Document Review
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">Help clients with form completion</p>
                <Button className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold shadow-lg">
                  Pending Forms
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-4 border-amber-400 shadow-2xl glitter">
            <CardHeader className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Scale className="h-8 w-8" />
                {user?.organization}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <p className="text-lg text-gray-700 mb-6">
                As a {isLawyer ? 'pro bono attorney' : 'paralegal'}, you can:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-3 text-lg">
                <li>Provide legal consultations to homeless individuals</li>
                <li>Review and help complete legal forms</li>
                <li>Offer guidance on evictions, warrants, and court cases</li>
                <li>Connect clients with additional resources</li>
                {isLawyer && <li className="font-bold text-indigo-700">Represent clients in court (attorney only)</li>}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
