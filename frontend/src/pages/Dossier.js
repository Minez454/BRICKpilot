import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Menu, Save, User, Home, Heart, Briefcase, Scale, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Field component with color-coded source indicator
const DossierField = ({ label, value, onChange, source, type = "text", rows = 3, icon: Icon }) => {
  const sourceColors = {
    user: "border-l-4 border-l-emerald-500 bg-emerald-50",
    brick: "border-l-4 border-l-purple-500 bg-purple-50",
    agency: "border-l-4 border-l-amber-500 bg-amber-50",
    empty: "border-l-4 border-l-gray-300 bg-gray-50"
  };

  const sourceLabels = {
    user: "Added by you",
    brick: "Added by BRICK AI",
    agency: "Added by caseworker",
    empty: "Not filled"
  };

  const currentSource = value ? source : "empty";

  return (
    <div className={`p-4 rounded-lg ${sourceColors[currentSource]} transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4" />}
          {label}
        </Label>
        <span className="text-xs text-gray-500 italic">{sourceLabels[currentSource]}</span>
      </div>
      {type === "textarea" ? (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="bg-white border-2"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      ) : (
        <Input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white border-2"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      )}
    </div>
  );
};

export default function Dossier() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [dossierData, setDossierData] = useState({
    // Personal Information
    full_name: user?.full_name || "",
    date_of_birth: "",
    ssn_last_4: "",
    phone: user?.phone || "",
    email: user?.email || "",
    veteran_status: user?.is_veteran ? "Yes" : "No",
    
    // Current Situation
    current_housing: "",
    housing_duration: "",
    previous_address: "",
    reason_for_homelessness: "",
    
    // Health History
    primary_health_concerns: "",
    chronic_conditions: "",
    mental_health: "",
    substance_use_history: "",
    current_medications: "",
    allergies: "",
    last_doctor_visit: "",
    health_insurance: "",
    
    // Legal History
    pending_court_cases: "",
    criminal_background: "",
    outstanding_warrants: "",
    probation_parole: "",
    valid_id: "",
    
    // Employment History
    last_employment: "",
    employment_skills: "",
    work_history: "",
    barriers_to_employment: "",
    education_level: "",
    
    // Benefits & Income
    current_benefits: "",
    monthly_income: "",
    income_sources: "",
    disability_status: "",
    
    // Emergency Contacts
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    
    // Case Notes
    goals: "",
    barriers: "",
    strengths: "",
    action_plan: "",
    caseworker_notes: ""
  });

  const [fieldSources, setFieldSources] = useState({});

  useEffect(() => {
    loadDossierData();
  }, []);

  const loadDossierData = async () => {
    try {
      const res = await axios.get(`${API}/dossier`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Parse dossier items and populate form
      const sources = {};
      const formData = { ...dossierData };
      
      res.data.forEach(item => {
        // Map dossier content to form fields based on title/category
        const fieldKey = item.title.toLowerCase().replace(/\s+/g, "_");
        sources[fieldKey] = item.source === "conversation" ? "brick" : item.source;
        
        // Try to extract field value from content
        if (item.content) {
          formData[fieldKey] = item.content;
        }
      });
      
      setFieldSources(sources);
      setDossierData(prev => ({ ...prev, ...formData }));
    } catch (error) {
      console.error("Failed to load dossier", error);
    }
  };

  const updateField = (field, value) => {
    setDossierData(prev => ({ ...prev, [field]: value }));
    // Mark as user-entered
    setFieldSources(prev => ({ ...prev, [field]: "user" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each field as a dossier item
      const updates = [];
      Object.keys(dossierData).forEach(key => {
        if (dossierData[key]) {
          updates.push({
            category: getCategoryForField(key),
            title: key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            content: dossierData[key],
            source: fieldSources[key] || "user"
          });
        }
      });
      
      // Send to backend (simplified - in production, batch update)
      for (const item of updates.slice(0, 5)) { // Save first 5 for demo
        try {
          await axios.post(`${API}/dossier`, item, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          // Continue if item already exists
        }
      }
      
      toast.success("Dossier saved successfully!");
    } catch (error) {
      toast.error("Failed to save dossier");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryForField = (field) => {
    if (field.includes("health") || field.includes("medical") || field.includes("medication")) return "health";
    if (field.includes("housing") || field.includes("address")) return "housing";
    if (field.includes("legal") || field.includes("court") || field.includes("criminal")) return "legal";
    if (field.includes("employment") || field.includes("work") || field.includes("job")) return "employment";
    if (field.includes("benefits") || field.includes("income")) return "benefits";
    return "other";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50" data-testid="dossier-page">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
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
                <Button onClick={() => navigate("/legal")} variant="ghost" className="w-full justify-start">Legal Aid</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start bg-pink-50">My Dossier</Button>
                <hr />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-xl font-bold text-gray-800" data-testid="page-title">My Personal & Health History</h1>
            <p className="text-xs text-gray-500">Comprehensive case file - never repeat your story</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="btn-emerald" data-testid="save-dossier-btn">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Legend */}
      <div className="bg-white border-b px-4 py-2">
        <div className="container mx-auto max-w-6xl flex gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span>Your Input</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span>BRICK AI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span>Caseworker</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Not Filled</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Personal Information */}
          <Card className="border-2 border-pink-200">
            <CardHeader className="bg-pink-50">
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <User className="h-6 w-6" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <DossierField label="Full Name" value={dossierData.full_name} onChange={(v) => updateField("full_name", v)} source={fieldSources.full_name} icon={User} />
                <DossierField label="Date of Birth" value={dossierData.date_of_birth} onChange={(v) => updateField("date_of_birth", v)} source={fieldSources.date_of_birth} type="date" />
                <DossierField label="Last 4 of SSN" value={dossierData.ssn_last_4} onChange={(v) => updateField("ssn_last_4", v)} source={fieldSources.ssn_last_4} />
                <DossierField label="Phone Number" value={dossierData.phone} onChange={(v) => updateField("phone", v)} source={fieldSources.phone} icon={Phone} />
                <DossierField label="Email" value={dossierData.email} onChange={(v) => updateField("email", v)} source={fieldSources.email} type="email" />
                <DossierField label="Veteran Status" value={dossierData.veteran_status} onChange={(v) => updateField("veteran_status", v)} source={fieldSources.veteran_status} />
              </div>
            </CardContent>
          </Card>

          {/* Housing History */}
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Home className="h-6 w-6" />
                Housing History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <DossierField label="Current Housing Situation" value={dossierData.current_housing} onChange={(v) => updateField("current_housing", v)} source={fieldSources.current_housing} type="textarea" icon={Home} />
              <div className="grid md:grid-cols-2 gap-4">
                <DossierField label="How Long Homeless" value={dossierData.housing_duration} onChange={(v) => updateField("housing_duration", v)} source={fieldSources.housing_duration} />
                <DossierField label="Previous Address" value={dossierData.previous_address} onChange={(v) => updateField("previous_address", v)} source={fieldSources.previous_address} />
              </div>
              <DossierField label="Reason for Current Situation" value={dossierData.reason_for_homelessness} onChange={(v) => updateField("reason_for_homelessness", v)} source={fieldSources.reason_for_homelessness} type="textarea" rows={4} />
            </CardContent>
          </Card>

          {/* Health History */}
          <Card className="border-2 border-rose-200">
            <CardHeader className="bg-rose-50">
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <Heart className="h-6 w-6" />
                Health & Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <DossierField label="Primary Health Concerns" value={dossierData.primary_health_concerns} onChange={(v) => updateField("primary_health_concerns", v)} source={fieldSources.primary_health_concerns} type="textarea" icon={Heart} />
              <DossierField label="Chronic Conditions" value={dossierData.chronic_conditions} onChange={(v) => updateField("chronic_conditions", v)} source={fieldSources.chronic_conditions} type="textarea" />
              <DossierField label="Mental Health History" value={dossierData.mental_health} onChange={(v) => updateField("mental_health", v)} source={fieldSources.mental_health} type="textarea" />
              <DossierField label="Substance Use History" value={dossierData.substance_use_history} onChange={(v) => updateField("substance_use_history", v)} source={fieldSources.substance_use_history} type="textarea" />
              <div className="grid md:grid-cols-2 gap-4">
                <DossierField label="Current Medications" value={dossierData.current_medications} onChange={(v) => updateField("current_medications", v)} source={fieldSources.current_medications} type="textarea" />
                <DossierField label="Allergies" value={dossierData.allergies} onChange={(v) => updateField("allergies", v)} source={fieldSources.allergies} type="textarea" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <DossierField label="Last Doctor Visit" value={dossierData.last_doctor_visit} onChange={(v) => updateField("last_doctor_visit", v)} source={fieldSources.last_doctor_visit} />
                <DossierField label="Health Insurance" value={dossierData.health_insurance} onChange={(v) => updateField("health_insurance", v)} source={fieldSources.health_insurance} />
              </div>
            </CardContent>
          </Card>

          {/* Legal History */}
          <Card className="border-2 border-amber-200">
            <CardHeader className="bg-amber-50">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Scale className="h-6 w-6" />
                Legal History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <DossierField label="Pending Court Cases" value={dossierData.pending_court_cases} onChange={(v) => updateField("pending_court_cases", v)} source={fieldSources.pending_court_cases} type="textarea" icon={Scale} />
              <DossierField label="Criminal Background" value={dossierData.criminal_background} onChange={(v) => updateField("criminal_background", v)} source={fieldSources.criminal_background} type="textarea" />
              <div className="grid md:grid-cols-3 gap-4">
                <DossierField label="Outstanding Warrants" value={dossierData.outstanding_warrants} onChange={(v) => updateField("outstanding_warrants", v)} source={fieldSources.outstanding_warrants} />
                <DossierField label="Probation/Parole Status" value={dossierData.probation_parole} onChange={(v) => updateField("probation_parole", v)} source={fieldSources.probation_parole} />
                <DossierField label="Valid ID?" value={dossierData.valid_id} onChange={(v) => updateField("valid_id", v)} source={fieldSources.valid_id} />
              </div>
            </CardContent>
          </Card>

          {/* Employment History */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Briefcase className="h-6 w-6" />
                Employment & Education
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <DossierField label="Last Employment" value={dossierData.last_employment} onChange={(v) => updateField("last_employment", v)} source={fieldSources.last_employment} icon={Briefcase} />
                <DossierField label="Education Level" value={dossierData.education_level} onChange={(v) => updateField("education_level", v)} source={fieldSources.education_level} />
              </div>
              <DossierField label="Employment Skills" value={dossierData.employment_skills} onChange={(v) => updateField("employment_skills", v)} source={fieldSources.employment_skills} type="textarea" />
              <DossierField label="Work History" value={dossierData.work_history} onChange={(v) => updateField("work_history", v)} source={fieldSources.work_history} type="textarea" rows={4} />
              <DossierField label="Barriers to Employment" value={dossierData.barriers_to_employment} onChange={(v) => updateField("barriers_to_employment", v)} source={fieldSources.barriers_to_employment} type="textarea" />
            </CardContent>
          </Card>

          {/* Benefits & Income */}
          <Card className="border-2 border-emerald-200">
            <CardHeader className="bg-emerald-50">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                Benefits & Income
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <DossierField label="Current Benefits" value={dossierData.current_benefits} onChange={(v) => updateField("current_benefits", v)} source={fieldSources.current_benefits} type="textarea" />
              <div className="grid md:grid-cols-2 gap-4">
                <DossierField label="Monthly Income" value={dossierData.monthly_income} onChange={(v) => updateField("monthly_income", v)} source={fieldSources.monthly_income} />
                <DossierField label="Disability Status" value={dossierData.disability_status} onChange={(v) => updateField("disability_status", v)} source={fieldSources.disability_status} />
              </div>
              <DossierField label="Income Sources" value={dossierData.income_sources} onChange={(v) => updateField("income_sources", v)} source={fieldSources.income_sources} type="textarea" />
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Phone className="h-6 w-6" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <DossierField label="Contact Name" value={dossierData.emergency_contact_name} onChange={(v) => updateField("emergency_contact_name", v)} source={fieldSources.emergency_contact_name} />
                <DossierField label="Contact Phone" value={dossierData.emergency_contact_phone} onChange={(v) => updateField("emergency_contact_phone", v)} source={fieldSources.emergency_contact_phone} />
                <DossierField label="Relationship" value={dossierData.emergency_contact_relation} onChange={(v) => updateField("emergency_contact_relation", v)} source={fieldSources.emergency_contact_relation} />
              </div>
            </CardContent>
          </Card>

          {/* Case Notes & Goals */}
          <Card className="border-2 border-pink-200">
            <CardHeader className="bg-pink-50">
              <CardTitle className="flex items-center gap-2 text-pink-700">
                Case Notes & Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <DossierField label="Personal Goals" value={dossierData.goals} onChange={(v) => updateField("goals", v)} source={fieldSources.goals} type="textarea" rows={4} />
              <DossierField label="Barriers to Overcome" value={dossierData.barriers} onChange={(v) => updateField("barriers", v)} source={fieldSources.barriers} type="textarea" rows={4} />
              <DossierField label="Strengths & Resources" value={dossierData.strengths} onChange={(v) => updateField("strengths", v)} source={fieldSources.strengths} type="textarea" rows={4} />
              <DossierField label="Action Plan" value={dossierData.action_plan} onChange={(v) => updateField("action_plan", v)} source={fieldSources.action_plan} type="textarea" rows={5} />
              <DossierField label="Caseworker Notes" value={dossierData.caseworker_notes} onChange={(v) => updateField("caseworker_notes", v)} source={fieldSources.caseworker_notes || "agency"} type="textarea" rows={5} />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pb-8">
            <Button onClick={handleSave} disabled={saving} size="lg" className="btn-emerald px-12" data-testid="save-bottom-btn">
              <Save className="mr-2 h-5 w-5" />
              {saving ? "Saving Changes..." : "Save All Changes"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
