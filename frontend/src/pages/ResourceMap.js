import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, MapPin, Phone, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function ResourceMap() {
  const { user, token, logout } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
  }, [selectedCategory, token]);

  const loadResources = async () => {
    try {
      const url = selectedCategory 
        ? `${API}/resources?category=${selectedCategory}`
        : `${API}/resources`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResources(res.data);
    } catch (error) {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "shelter", label: "Shelters", color: "bg-emerald-500" },
    { value: "food", label: "Food", color: "bg-rose-500" },
    { value: "medical", label: "Medical", color: "bg-blue-500" },
    { value: "legal", label: "Legal", color: "bg-amber-500" },
    { value: "housing", label: "Housing", color: "bg-purple-500" },
    { value: "employment", label: "Jobs", color: "bg-pink-500" }
  ];

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.color : "bg-gray-500";
  };

  return (
    <div className="h-screen flex flex-col" data-testid="resource-map-page">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-md z-10">
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
                <Button onClick={() => navigate("/brick")} variant="ghost" className="w-full justify-start" data-testid="menu-brick">BRICK AI</Button>
                <Button onClick={() => navigate("/resources")} variant="ghost" className="w-full justify-start bg-emerald-50" data-testid="menu-resources">Resources Map</Button>
                <Button onClick={() => navigate("/vault")} variant="ghost" className="w-full justify-start" data-testid="menu-vault">The Vault</Button>
                <Button onClick={() => navigate("/workbook")} variant="ghost" className="w-full justify-start" data-testid="menu-workbook">My Workbook</Button>
                <Button onClick={() => navigate("/legal")} variant="ghost" className="w-full justify-start" data-testid="menu-legal">Legal Aid</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start" data-testid="menu-dossier">My Dossier</Button>
                <hr />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600" data-testid="menu-logout">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-xl font-bold text-gray-800" data-testid="page-title">Las Vegas Resources</h1>
            <p className="text-xs text-gray-500">Real-time service locations</p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border-b px-4 py-3 flex gap-2 overflow-x-auto z-10">
        <Button
          size="sm"
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className="rounded-full"
          data-testid="filter-all"
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.value}
            size="sm"
            variant={selectedCategory === cat.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat.value)}
            className="rounded-full"
            data-testid={`filter-${cat.value}`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Map and List */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative" data-testid="map-container">
          <MapContainer
            center={[36.1699, -115.1398]} // Las Vegas
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {resources.map(resource => (
              <Marker
                key={resource.id}
                position={[resource.coordinates.lat, resource.coordinates.lng]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-base mb-1">{resource.name}</h3>
                    <Badge className={`${getCategoryColor(resource.category)} text-white mb-2`}>
                      {resource.category}
                    </Badge>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {resource.address}
                    </p>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {resource.phone}
                    </p>
                    {resource.hours && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {resource.hours}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Resource List */}
        <div className="w-96 bg-white border-l overflow-y-auto" data-testid="resource-list">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">
              {resources.length} Resource{resources.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="space-y-3">
              {resources.map(resource => (
                <Card key={resource.id} className="border-2" data-testid={`resource-card-${resource.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{resource.name}</CardTitle>
                      <Badge className={`${getCategoryColor(resource.category)} text-white text-xs`}>
                        {resource.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{resource.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <a href={`tel:${resource.phone}`} className="text-emerald-600 hover:underline">
                        {resource.phone}
                      </a>
                    </div>
                    {resource.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{resource.hours}</span>
                      </div>
                    )}
                    {resource.services && resource.services.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1">
                        {resource.services.map((service, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
