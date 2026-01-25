import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Menu, Search, MapPin, Phone, Clock, Mail, Send, Building2, 
  Heart, Home, Utensils, Briefcase, Scale, Stethoscope, Users,
  ChevronRight, Star, MessageSquare, FileText, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import NotificationBell from "../components/NotificationBell";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Organization data with full details
const ORGANIZATIONS = [
  {
    id: "shine-a-light",
    name: "Shine-A-Light Las Vegas",
    category: "outreach",
    description: "Mobile outreach team providing essential supplies, resources, and compassionate support to unhoused individuals throughout Las Vegas.",
    services: ["Mobile Outreach", "Essential Supplies", "Resource Navigation", "Warm Clothing Distribution", "Hygiene Kits"],
    address: "Various Locations - Mobile Service",
    phone: "(702) 555-7446",
    email: "outreach@shinealightlv.org",
    hours: "Mon-Sat: 6am-10pm",
    website: "https://shinealightlv.org",
    color: "amber",
    icon: "sun",
    applications: ["Volunteer Application", "Supply Request Form"]
  },
  {
    id: "recover-lv",
    name: "Recover Las Vegas",
    category: "recovery",
    description: "Comprehensive recovery services including substance abuse treatment, mental health support, and transitional housing assistance.",
    services: ["Substance Abuse Treatment", "Mental Health Counseling", "Peer Support Groups", "Transitional Housing", "Job Training"],
    address: "1234 Recovery Blvd, Las Vegas, NV 89101",
    phone: "(702) 555-7328",
    email: "team@recoverlv.org",
    hours: "24/7 Crisis Line Available",
    website: "https://recoverlv.org",
    color: "emerald",
    icon: "leaf",
    applications: ["Treatment Intake Form", "Housing Application"]
  },
  {
    id: "help-sn",
    name: "H.E.L.P. of Southern Nevada",
    category: "shelter",
    description: "Emergency shelter and comprehensive homeless services including meals, case management, and housing assistance programs.",
    services: ["Emergency Shelter", "Hot Meals", "Case Management", "Housing Navigation", "ID Assistance", "Mail Services"],
    address: "1640 E Flamingo Rd, Las Vegas, NV 89119",
    phone: "(702) 369-4357",
    email: "services@helpsn.org",
    hours: "Shelter: 24/7 | Services: 8am-5pm",
    website: "https://helpsn.org",
    color: "blue",
    icon: "home",
    applications: ["Shelter Intake", "Rapid Rehousing Application", "SSVF Application (Veterans)"]
  },
  {
    id: "courtyard",
    name: "The Courtyard Homeless Resource Center",
    category: "resource_center",
    description: "Comprehensive day resource center offering meals, showers, laundry, and connections to housing and employment services.",
    services: ["Day Services", "Meals", "Showers", "Laundry", "Storage Lockers", "Employment Resources", "Housing Navigation"],
    address: "1401 Las Vegas Blvd N, Las Vegas, NV 89101",
    phone: "(702) 229-6117",
    email: "staff@courtyardlv.org",
    hours: "Daily: 7am-3pm",
    website: "https://lasvegasnevada.gov/courtyard",
    color: "stone",
    icon: "building",
    applications: ["Day Services Registration", "Employment Program Application"]
  },
  {
    id: "catholic-charities",
    name: "Catholic Charities of Southern Nevada",
    category: "social_services",
    description: "Multi-service organization providing food assistance, housing programs, immigration services, and family support.",
    services: ["Food Pantry", "Immigration Services", "Housing Assistance", "Family Services", "Senior Programs", "Disaster Relief"],
    address: "1501 Las Vegas Blvd N, Las Vegas, NV 89101",
    phone: "(702) 385-2662",
    email: "outreach@catholiccharities.org",
    hours: "Mon-Fri: 8am-4:30pm",
    website: "https://catholiccharities.com",
    color: "rose",
    icon: "heart",
    applications: ["Food Assistance Application", "Housing Program Application"]
  },
  {
    id: "salvation-army",
    name: "Salvation Army Las Vegas",
    category: "shelter",
    description: "Emergency shelter, rehabilitation programs, and social services for individuals and families experiencing homelessness.",
    services: ["Emergency Shelter", "Rehabilitation Program", "Food Services", "Utility Assistance", "Holiday Assistance"],
    address: "35 W Owens Ave, Las Vegas, NV 89030",
    phone: "(702) 649-8240",
    email: "services@salvationarmylv.org",
    hours: "Shelter: 24/7 | Office: 9am-3pm",
    website: "https://salvationarmysouthernnevada.org",
    color: "red",
    icon: "heart",
    applications: ["Shelter Application", "Rehabilitation Program Application"]
  },
  {
    id: "nphy",
    name: "Nevada Partnership for Homeless Youth",
    category: "youth",
    description: "Dedicated services for homeless and at-risk youth including emergency shelter, education support, and independent living programs.",
    services: ["Youth Emergency Shelter", "Drop-In Center", "Education Support", "Independent Living Program", "Family Reunification"],
    address: "4981 Shirley St, Las Vegas, NV 89119",
    phone: "(702) 383-1332",
    email: "youth@nphy.org",
    hours: "24/7 Youth Crisis Line",
    website: "https://nphy.org",
    color: "purple",
    icon: "users",
    applications: ["Youth Intake Form", "Safe Place Request"]
  },
  {
    id: "veterans-village",
    name: "Veterans Village Las Vegas",
    category: "veterans",
    description: "Comprehensive services exclusively for veterans including transitional housing, employment assistance, and VA benefits navigation.",
    services: ["Veteran Housing", "Employment Services", "VA Benefits Help", "Peer Support", "Legal Assistance", "Healthcare Navigation"],
    address: "1150 S Las Vegas Blvd, Las Vegas, NV 89104",
    phone: "(702) 383-8387",
    email: "veterans@veteransvillage.org",
    hours: "Mon-Fri: 8am-5pm",
    website: "https://veteransvillage.org",
    color: "blue",
    icon: "star",
    applications: ["Veteran Housing Application", "SSVF Application", "Employment Program"]
  },
  {
    id: "shannon-west",
    name: "Shannon West Homeless Youth Center",
    category: "youth",
    description: "Safe haven for homeless youth ages 16-24 providing shelter, meals, education, and life skills training.",
    services: ["Youth Shelter", "Meals", "Education Programs", "Life Skills Training", "Mental Health Services", "Job Readiness"],
    address: "1650 E Flamingo Rd, Las Vegas, NV 89119",
    phone: "(702) 369-4357",
    email: "shelter@shannonwest.org",
    hours: "24/7",
    website: "https://helpsn.org/shannon-west",
    color: "pink",
    icon: "heart",
    applications: ["Youth Shelter Intake", "Education Program Enrollment"]
  },
  {
    id: "tracb",
    name: "TRAC-B Harm Reduction",
    category: "health",
    description: "Mobile harm reduction services including needle exchange, HIV/Hepatitis testing, naloxone distribution, and health education.",
    services: ["Needle Exchange", "HIV/Hep C Testing", "Naloxone Distribution", "Wound Care", "Health Education", "Resource Navigation"],
    address: "Mobile Service - Various Locations",
    phone: "(702) 759-0702",
    email: "mobile@tracb.org",
    hours: "Check website for mobile schedule",
    website: "https://tracb.org",
    color: "orange",
    icon: "stethoscope",
    applications: ["None - Walk-up services"]
  },
  {
    id: "legal-aid",
    name: "Legal Aid Center of Southern Nevada",
    category: "legal",
    description: "Free civil legal services for low-income individuals including housing, family law, consumer protection, and immigration.",
    services: ["Housing/Eviction Defense", "Family Law", "Consumer Protection", "Immigration Help", "Record Sealing", "Pro Bono Clinics"],
    address: "725 E Charleston Blvd, Las Vegas, NV 89104",
    phone: "(702) 386-1070",
    email: "lawyer@legalaid.org",
    hours: "Mon-Fri: 8am-5pm",
    website: "https://lacsn.org",
    color: "indigo",
    icon: "scale",
    applications: ["Legal Assistance Application", "Ask-A-Lawyer Appointment"]
  },
  {
    id: "three-square",
    name: "Three Square Food Bank",
    category: "food",
    description: "Southern Nevada's food bank providing meals through food pantries, mobile distributions, and community partners.",
    services: ["Food Pantries", "Mobile Distributions", "Senior Programs", "Kids Cafe", "SNAP Enrollment Help"],
    address: "4190 N Pecos Rd, Las Vegas, NV 89115",
    phone: "(702) 644-3663",
    email: "info@threesquare.org",
    hours: "Distribution varies by location",
    website: "https://threesquare.org",
    color: "green",
    icon: "utensils",
    applications: ["Find a Pantry Near You"]
  }
];

const CATEGORIES = [
  { id: "all", label: "All Services", icon: Building2 },
  { id: "shelter", label: "Shelters", icon: Home },
  { id: "food", label: "Food", icon: Utensils },
  { id: "health", label: "Healthcare", icon: Stethoscope },
  { id: "recovery", label: "Recovery", icon: Heart },
  { id: "legal", label: "Legal Aid", icon: Scale },
  { id: "veterans", label: "Veterans", icon: Star },
  { id: "youth", label: "Youth Services", icon: Users },
  { id: "outreach", label: "Outreach", icon: MapPin },
  { id: "resource_center", label: "Resource Centers", icon: Building2 },
  { id: "social_services", label: "Social Services", icon: Heart }
];

export default function Directory() {
  const { user, token, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const filteredOrgs = ORGANIZATIONS.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || org.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getColorClasses = (color) => {
    const colors = {
      amber: { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
      emerald: { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
      blue: { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700", border: "border-blue-300" },
      rose: { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-700", border: "border-rose-300" },
      red: { bg: "bg-red-500", light: "bg-red-50", text: "text-red-700", border: "border-red-300" },
      purple: { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", border: "border-purple-300" },
      pink: { bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-700", border: "border-pink-300" },
      orange: { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
      indigo: { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-300" },
      green: { bg: "bg-green-500", light: "bg-green-50", text: "text-green-700", border: "border-green-300" },
      stone: { bg: "bg-stone-500", light: "bg-stone-50", text: "text-stone-700", border: "border-stone-300" }
    };
    return colors[color] || colors.emerald;
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setSending(true);
    try {
      await axios.post(`${API}/directory/message`, {
        organization_id: selectedOrg.id,
        organization_name: selectedOrg.name,
        message: messageText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Message sent to ${selectedOrg.name}! They will respond to your account.`);
      setMessageOpen(false);
      setMessageText("");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen oz-gradient" data-testid="directory-page">
      {/* Header */}
      <div className="oz-header px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="menu-button">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="text-2xl font-bold text-emerald-700 mb-6">BRICK Menu</SheetTitle>
              <div className="space-y-3">
                <Button onClick={() => navigate("/brick")} variant="ghost" className="w-full justify-start text-lg hover:bg-emerald-50">BRICK AI</Button>
                <Button onClick={() => navigate("/directory")} variant="ghost" className="w-full justify-start text-lg bg-amber-50">Resource Directory</Button>
                <Button onClick={() => navigate("/resources")} variant="ghost" className="w-full justify-start text-lg hover:bg-rose-50">Resources Map</Button>
                <Button onClick={() => navigate("/vault")} variant="ghost" className="w-full justify-start text-lg hover:bg-purple-50">The Vault</Button>
                <Button onClick={() => navigate("/workbook")} variant="ghost" className="w-full justify-start text-lg hover:bg-blue-50">My Workbook</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start text-lg hover:bg-pink-50">My Dossier</Button>
                <hr className="my-4" />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-lg text-red-600 hover:bg-red-50">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-2xl font-bold text-white gold-text" style={{fontFamily: 'Cinzel, serif'}}>Resource Directory</h1>
            <p className="text-xs text-emerald-100">Find help in Las Vegas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/95 backdrop-blur-lg border-b-2 border-yellow-300 px-4 py-4 shadow-lg">
        <div className="container mx-auto">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search organizations or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 text-lg border-2 border-emerald-200 rounded-xl"
              data-testid="directory-search"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 ${selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'border-2 border-emerald-200'}`}
                  data-testid={`category-${cat.id}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Organization Grid */}
      <div className="container mx-auto px-4 py-8">
        <p className="text-white mb-4 font-medium">{filteredOrgs.length} organizations found</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrgs.map(org => {
            const colors = getColorClasses(org.color);
            return (
              <Card 
                key={org.id} 
                className={`border-2 ${colors.border} hover:shadow-2xl transition-all cursor-pointer overflow-hidden`}
                onClick={() => setSelectedOrg(org)}
                data-testid={`org-card-${org.id}`}
              >
                <div className={`h-2 ${colors.bg}`}></div>
                <CardHeader className={colors.light}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${colors.text}`}>{org.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {org.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 ${colors.text}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{org.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {org.services.slice(0, 3).map((service, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">{service}</Badge>
                    ))}
                    {org.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{org.services.length - 3} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Organization Detail Dialog */}
      <Dialog open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrg && (
            <>
              <DialogHeader>
                <div className={`-mx-6 -mt-6 mb-4 p-6 ${getColorClasses(selectedOrg.color).light} border-b-2 ${getColorClasses(selectedOrg.color).border}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${getColorClasses(selectedOrg.color).bg} rounded-2xl flex items-center justify-center shadow-xl`}>
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <DialogTitle className={`text-2xl ${getColorClasses(selectedOrg.color).text}`} style={{fontFamily: 'Cinzel, serif'}}>
                        {selectedOrg.name}
                      </DialogTitle>
                      <Badge className={`mt-1 ${getColorClasses(selectedOrg.color).bg} text-white capitalize`}>
                        {selectedOrg.category.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogDescription className="text-base text-gray-700">
                  {selectedOrg.description}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="services" className="mt-4">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOrg.services.map((service, idx) => (
                      <div key={idx} className={`p-3 ${getColorClasses(selectedOrg.color).light} rounded-lg border ${getColorClasses(selectedOrg.color).border}`}>
                        <span className="text-sm font-medium text-gray-700">{service}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="mt-4 space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className={`h-5 w-5 ${getColorClasses(selectedOrg.color).text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-semibold text-gray-800">Address</p>
                      <p className="text-gray-600">{selectedOrg.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className={`h-5 w-5 ${getColorClasses(selectedOrg.color).text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-semibold text-gray-800">Phone</p>
                      <a href={`tel:${selectedOrg.phone}`} className="text-blue-600 hover:underline">{selectedOrg.phone}</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Clock className={`h-5 w-5 ${getColorClasses(selectedOrg.color).text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-semibold text-gray-800">Hours</p>
                      <p className="text-gray-600">{selectedOrg.hours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className={`h-5 w-5 ${getColorClasses(selectedOrg.color).text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-semibold text-gray-800">Email</p>
                      <a href={`mailto:${selectedOrg.email}`} className="text-blue-600 hover:underline">{selectedOrg.email}</a>
                    </div>
                  </div>
                  {selectedOrg.website && (
                    <a 
                      href={selectedOrg.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 p-4 ${getColorClasses(selectedOrg.color).bg} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity`}
                    >
                      <ExternalLink className="h-5 w-5" />
                      Visit Website
                    </a>
                  )}
                </TabsContent>

                <TabsContent value="applications" className="mt-4">
                  <div className="space-y-3">
                    {selectedOrg.applications.map((app, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 ${getColorClasses(selectedOrg.color).light} rounded-xl border ${getColorClasses(selectedOrg.color).border}`}>
                        <div className="flex items-center gap-3">
                          <FileText className={`h-5 w-5 ${getColorClasses(selectedOrg.color).text}`} />
                          <span className="font-medium text-gray-800">{app}</span>
                        </div>
                        <Button size="sm" className={getColorClasses(selectedOrg.color).bg}>
                          Request
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button 
                  className={`flex-1 ${getColorClasses(selectedOrg.color).bg} text-white`}
                  onClick={() => setMessageOpen(true)}
                  data-testid="message-org-btn"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  className={`flex-1 border-2 ${getColorClasses(selectedOrg.color).border} ${getColorClasses(selectedOrg.color).text}`}
                  onClick={() => window.open(`tel:${selectedOrg.phone}`)}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Message {selectedOrg?.name}
            </DialogTitle>
            <DialogDescription>
              Send a message to this organization. They will respond to your BRICK account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Your Message</Label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Describe what help you need..."
                rows={5}
                className="mt-2"
                data-testid="message-textarea"
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 btn-emerald"
                onClick={handleSendMessage}
                disabled={sending}
                data-testid="send-message-btn"
              >
                {sending ? "Sending..." : "Send Message"}
                <Send className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
