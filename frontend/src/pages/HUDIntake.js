import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronRight, ChevronLeft, CheckCircle, User, Home, Calendar, 
  Heart, Shield, FileText, AlertTriangle, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// HUD Field Options
const RACE_OPTIONS = [
  { value: 1, label: "American Indian, Alaska Native, or Indigenous" },
  { value: 2, label: "Asian or Asian American" },
  { value: 3, label: "Black, African American, or African" },
  { value: 4, label: "Native Hawaiian or Pacific Islander" },
  { value: 5, label: "White" },
  { value: 6, label: "Middle Eastern or North African" }
];

const ETHNICITY_OPTIONS = [
  { value: 0, label: "Non-Hispanic/Non-Latin(a)(o)(x)" },
  { value: 1, label: "Hispanic/Latin(a)(o)(x)" }
];

const GENDER_OPTIONS = [
  { value: 0, label: "Woman (Girl, if child)" },
  { value: 1, label: "Man (Boy, if child)" },
  { value: 2, label: "Non-Binary" },
  { value: 3, label: "Culturally Specific Identity" },
  { value: 4, label: "Transgender" },
  { value: 5, label: "Questioning" },
  { value: 6, label: "Different Identity" }
];

const SEX_AT_BIRTH_OPTIONS = [
  { value: 0, label: "Female" },
  { value: 1, label: "Male" }
];

const PRIOR_LIVING_OPTIONS = [
  { value: 16, label: "On the street, in a car, park, or abandoned building", category: "homeless" },
  { value: 1, label: "Emergency shelter or hotel paid by voucher", category: "homeless" },
  { value: 2, label: "Transitional housing for homeless persons", category: "homeless" },
  { value: 18, label: "Safe Haven", category: "homeless" },
  { value: 12, label: "Staying with family (temporary)", category: "housed" },
  { value: 13, label: "Staying with friends (temporary)", category: "housed" },
  { value: 14, label: "Hotel/motel (paid by self)", category: "housed" },
  { value: 10, label: "Rental apartment/house", category: "housed" },
  { value: 11, label: "Owned home", category: "housed" },
  { value: 7, label: "Jail, prison, or juvenile detention", category: "institutional" },
  { value: 4, label: "Psychiatric hospital", category: "institutional" },
  { value: 5, label: "Substance abuse treatment facility", category: "institutional" },
  { value: 6, label: "Hospital (medical)", category: "institutional" },
  { value: 24, label: "Long-term care or nursing home", category: "institutional" }
];

const LENGTH_OF_STAY_OPTIONS = [
  { value: 1, label: "One night or less" },
  { value: 2, label: "Two to six nights" },
  { value: 3, label: "One week to less than one month" },
  { value: 4, label: "One month to less than 90 days" },
  { value: 5, label: "90 days to less than one year" },
  { value: 6, label: "One year or longer" }
];

const TIMES_HOMELESS_OPTIONS = [
  { value: 1, label: "One time" },
  { value: 2, label: "Two times" },
  { value: 3, label: "Three times" },
  { value: 4, label: "Four or more times" }
];

export default function HUDIntake() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: "",
    last_name: "",
    dob: "",
    ssn_last4: "",
    
    // Demographics
    race: [],
    ethnicity: null,
    gender: [],
    sex_at_birth: null,
    veteran_status: null,
    
    // Prior Living (3.917)
    prior_living_situation: null,
    length_of_stay: null,
    times_homeless_past_3_years: null,
    months_homeless_past_3_years: "",
    
    // Contact
    phone: "",
    email: user?.email || ""
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => {
      const arr = prev[field] || [];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...arr, value] };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Save client profile
      await axios.post(`${API}/hmis/client-profile`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        dob: formData.dob,
        name_data_quality: 1,
        dob_data_quality: formData.dob ? 1 : 99,
        race: formData.race,
        ethnicity: formData.ethnicity,
        gender: formData.gender,
        sex_at_birth: formData.sex_at_birth,
        veteran_status: formData.veteran_status,
        phone_primary: formData.phone,
        email: formData.email
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Create enrollment
      await axios.post(`${API}/hmis/enrollments`, {
        prior_living_situation: formData.prior_living_situation,
        length_of_stay: formData.length_of_stay,
        times_homeless_past_3_years: formData.times_homeless_past_3_years,
        months_homeless_past_3_years: parseInt(formData.months_homeless_past_3_years) || 99
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success("Intake complete! Your information has been saved securely.");
      navigate("/brick");
    } catch (error) {
      toast.error("Failed to save intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isHomelessSituation = [1, 2, 16, 18].includes(formData.prior_living_situation);

  return (
    <div className="min-h-screen oz-gradient py-8 px-4" data-testid="hud-intake-page">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white gold-text mb-2" style={{fontFamily: 'Cinzel, serif'}}>
            BRICK Intake
          </h1>
          <p className="text-emerald-100">
            This information helps us connect you with the right services
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-emerald-100 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>

        <Card className="border-2 border-yellow-400/50 shadow-2xl">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500"></div>
          
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Let's start with your basic info</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input 
                      value={formData.first_name}
                      onChange={(e) => updateField("first_name", e.target.value)}
                      placeholder="First name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input 
                      value={formData.last_name}
                      onChange={(e) => updateField("last_name", e.target.value)}
                      placeholder="Last name"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateField("dob", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last 4 digits of SSN (optional)</Label>
                  <Input 
                    value={formData.ssn_last4}
                    onChange={(e) => updateField("ssn_last4", e.target.value.slice(0,4))}
                    placeholder="XXXX"
                    maxLength={4}
                    className="mt-1 w-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">This helps verify your identity with agencies</p>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Demographics */}
          {step === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>About You</CardTitle>
                    <CardDescription>This helps us understand your needs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Race (select all that apply)</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {RACE_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={formData.race.includes(opt.value)}
                          onCheckedChange={() => toggleArrayField("race", opt.value)}
                        />
                        <Label className="font-normal cursor-pointer">{opt.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Ethnicity</Label>
                  <RadioGroup 
                    value={formData.ethnicity?.toString()} 
                    onValueChange={(v) => updateField("ethnicity", parseInt(v))}
                    className="mt-2"
                  >
                    {ETHNICITY_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value.toString()} />
                        <Label className="font-normal">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold">Gender Identity (select all that apply)</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {GENDER_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={formData.gender.includes(opt.value)}
                          onCheckedChange={() => toggleArrayField("gender", opt.value)}
                        />
                        <Label className="font-normal cursor-pointer">{opt.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Sex Assigned at Birth</Label>
                  <RadioGroup 
                    value={formData.sex_at_birth?.toString()} 
                    onValueChange={(v) => updateField("sex_at_birth", parseInt(v))}
                    className="mt-2"
                  >
                    {SEX_AT_BIRTH_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value.toString()} />
                        <Label className="font-normal">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Veteran & Contact */}
          {step === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Service & Contact</CardTitle>
                    <CardDescription>Veteran status and how to reach you</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Have you ever served in the U.S. Armed Forces?</Label>
                  <RadioGroup 
                    value={formData.veteran_status?.toString()} 
                    onValueChange={(v) => updateField("veteran_status", parseInt(v))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" />
                      <Label className="font-normal">Yes, I am a veteran</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" />
                      <Label className="font-normal">No</Label>
                    </div>
                  </RadioGroup>
                  {formData.veteran_status === 1 && (
                    <p className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      🎖️ Thank you for your service! You may qualify for VA housing programs like SSVF and HUD-VASH.
                    </p>
                  )}
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="(702) 555-1234"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Prior Living Situation (3.917) - CRITICAL */}
          {step === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Housing Situation</CardTitle>
                    <CardDescription>Where did you stay last night?</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Where did you sleep last night?</Label>
                  <RadioGroup 
                    value={formData.prior_living_situation?.toString()} 
                    onValueChange={(v) => updateField("prior_living_situation", parseInt(v))}
                    className="mt-3 space-y-2"
                  >
                    {PRIOR_LIVING_OPTIONS.map(opt => (
                      <div key={opt.value} className={`flex items-center space-x-2 p-2 rounded-lg ${
                        opt.category === 'homeless' ? 'bg-red-50 border border-red-200' :
                        opt.category === 'institutional' ? 'bg-purple-50 border border-purple-200' :
                        'bg-green-50 border border-green-200'
                      }`}>
                        <RadioGroupItem value={opt.value.toString()} />
                        <Label className="font-normal cursor-pointer flex-1">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {formData.prior_living_situation && (
                  <div>
                    <Label className="text-base font-semibold">How long were you in that place?</Label>
                    <RadioGroup 
                      value={formData.length_of_stay?.toString()} 
                      onValueChange={(v) => updateField("length_of_stay", parseInt(v))}
                      className="mt-2"
                    >
                      {LENGTH_OF_STAY_OPTIONS.map(opt => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value.toString()} />
                          <Label className="font-normal">{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Step 5: Homeless History */}
          {step === 5 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Housing History</CardTitle>
                    <CardDescription>Help us understand your situation better</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">
                    Including today, how many times have you been homeless in the past 3 years?
                  </Label>
                  <RadioGroup 
                    value={formData.times_homeless_past_3_years?.toString()} 
                    onValueChange={(v) => updateField("times_homeless_past_3_years", parseInt(v))}
                    className="mt-2"
                  >
                    {TIMES_HOMELESS_OPTIONS.map(opt => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value.toString()} />
                        <Label className="font-normal">{opt.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold">
                    Total months homeless in the past 3 years
                  </Label>
                  <Select 
                    value={formData.months_homeless_past_3_years} 
                    onValueChange={(v) => updateField("months_homeless_past_3_years", v)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select months" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <SelectItem key={m} value={m.toString()}>{m} month{m > 1 ? 's' : ''}</SelectItem>
                      ))}
                      <SelectItem value="101">More than 12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isHomelessSituation && formData.times_homeless_past_3_years === 4 && formData.months_homeless_past_3_years === "101" && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-amber-800">Chronically Homeless</p>
                        <p className="text-sm text-amber-700">
                          Based on your answers, you may qualify for Permanent Supportive Housing (PSH), 
                          which provides long-term housing with support services.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-800">Almost Done!</p>
                      <p className="text-sm text-emerald-700">
                        After completing intake, BRICK will guide you through a quick vulnerability 
                        assessment to match you with the right housing programs.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                className="btn-emerald"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-gold"
              >
                {loading ? "Saving..." : "Complete Intake"}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
