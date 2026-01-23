import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Menu, Upload, FileText, Shield, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Vault() {
  const { user, token, logout } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await axios.get(`${API}/vault/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (error) {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('file');
    
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        await axios.post(`${API}/vault/upload`, {
          document_type: formData.get('document_type'),
          file_name: file.name,
          file_data: base64
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success("Document uploaded securely!");
        setUploadOpen(false);
        loadDocuments();
      } catch (error) {
        toast.error("Upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  const docTypes = [
    { value: "dd214", label: "DD-214 (Military Discharge)", icon: "🎖️" },
    { value: "ssn", label: "Social Security Card", icon: "🆔" },
    { value: "id", label: "State ID/Driver's License", icon: "🪪" },
    { value: "birth_cert", label: "Birth Certificate", icon: "📜" },
    { value: "medical", label: "Medical Records", icon: "🏥" },
    { value: "other", label: "Other Document", icon: "📄" }
  ];

  const getDocIcon = (type) => {
    return docTypes.find(d => d.value === type)?.icon || "📄";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50" data-testid="vault-page">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-md">
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
                <Button onClick={() => navigate("/vault")} variant="ghost" className="w-full justify-start bg-purple-50">The Vault</Button>
                <Button onClick={() => navigate("/workbook")} variant="ghost" className="w-full justify-start">My Workbook</Button>
                <Button onClick={() => navigate("/legal")} variant="ghost" className="w-full justify-start">Legal Aid</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start">My Dossier</Button>
                <hr />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-xl font-bold text-gray-800" data-testid="page-title">The Vault</h1>
            <p className="text-xs text-gray-500">Secure document storage</p>
          </div>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="btn-ruby" data-testid="upload-document-btn">
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Secure Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="doc-type">Document Type</Label>
                <Select name="document_type" required>
                  <SelectTrigger data-testid="document-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {docTypes.map(dt => (
                      <SelectItem key={dt.value} value={dt.value}>
                        {dt.icon} {dt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File</Label>
                <Input id="file" name="file" type="file" required accept="image/*,.pdf" data-testid="file-input" />
              </div>
              <Button type="submit" className="w-full btn-emerald" data-testid="submit-upload-btn">
                Upload Securely
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Card className="oz-card border-purple-200 mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <CardTitle className="text-purple-700">Your Secure Vault</CardTitle>
                  <CardDescription>
                    All documents are encrypted and stored securely. Share with caseworkers when needed.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Yet</h3>
              <p className="text-gray-600 mb-6">Upload your important documents to keep them safe and accessible.</p>
              <Button onClick={() => setUploadOpen(true)} className="btn-emerald">
                <Upload className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {documents.map(doc => (
                <Card key={doc.id} className="border-2 hover:shadow-lg transition-shadow" data-testid={`document-card-${doc.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{getDocIcon(doc.document_type)}</div>
                        <div>
                          <CardTitle className="text-base">{doc.file_name}</CardTitle>
                          <p className="text-xs text-gray-500">
                            {docTypes.find(d => d.value === doc.document_type)?.label}
                          </p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="text-purple-600" data-testid={`download-btn-${doc.id}`}>
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
