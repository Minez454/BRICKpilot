import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Menu, BookOpen, Award, CheckCircle, Circle, Sparkles, 
  ChevronRight, Brain, Shield, DollarSign, Home, Briefcase,
  Heart, Scale, MessageSquare, Loader2, ArrowLeft, ExternalLink,
  BookMarked, Target, Lightbulb, GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import NotificationBell from "../components/NotificationBell";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORY_CONFIG = {
  life_skills: { icon: Lightbulb, color: "amber", label: "Life Skills" },
  financial: { icon: DollarSign, color: "green", label: "Financial" },
  safety_awareness: { icon: Shield, color: "red", label: "Safety" },
  housing: { icon: Home, color: "blue", label: "Housing" },
  employment: { icon: Briefcase, color: "purple", label: "Employment" },
  health_wellness: { icon: Heart, color: "rose", label: "Health" },
  legal_navigation: { icon: Scale, color: "indigo", label: "Legal" },
  communication: { icon: MessageSquare, color: "teal", label: "Communication" }
};

export default function Workbook() {
  const { user, token, logout } = useContext(AuthContext);
  const [workbooks, setWorkbooks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [flashcardAnswer, setFlashcardAnswer] = useState("");
  const [stats, setStats] = useState({ total_tasks: 0, completed_tasks: 0, total_points: 0, level: 1, total_workbooks: 0, completed_workbooks: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedWorkbook, setSelectedWorkbook] = useState(null);
  const [activeTab, setActiveTab] = useState("workbooks");
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workbooksRes, statsRes, flashcardsRes] = await Promise.all([
        axios.get(`${API}/workbooks`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/workbook/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/flashcards`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setWorkbooks(workbooksRes.data);
      setStats(statsRes.data);
      setFlashcards(flashcardsRes.data);
      
      // Set first unanswered flashcard
      const unanswered = flashcardsRes.data.find(fc => !fc.user_answer);
      if (unanswered) setCurrentFlashcard(unanswered);
    } catch (error) {
      console.error("Failed to load workbook data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkbooks = async () => {
    setGenerating(true);
    try {
      const response = await axios.post(`${API}/workbooks/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      loadData();
    } catch (error) {
      toast.error("Failed to generate workbooks. Try answering more flashcards first!");
    } finally {
      setGenerating(false);
    }
  };

  const submitFlashcardAnswer = async () => {
    if (!flashcardAnswer || !currentFlashcard) return;
    
    try {
      await axios.post(
        `${API}/flashcards/${currentFlashcard.id}/answer`,
        { answer: flashcardAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Answer saved! BRICK is learning about you.");
      setFlashcardAnswer("");
      
      // Move to next flashcard
      const updatedCards = await axios.get(`${API}/flashcards`, { headers: { Authorization: `Bearer ${token}` } });
      setFlashcards(updatedCards.data);
      const nextUnanswered = updatedCards.data.find(fc => !fc.user_answer);
      setCurrentFlashcard(nextUnanswered || null);
      
      // If all answered, prompt to generate workbooks
      if (!nextUnanswered && workbooks.length === 0) {
        toast.info("Great! Now BRICK can create personalized workbooks for you.", { duration: 5000 });
      }
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const updateWorkbookProgress = async (workbookId, type, itemId) => {
    try {
      const data = {};
      if (type === 'lesson') data.completed_lesson = itemId;
      if (type === 'exercise') data.completed_exercise = itemId;
      if (type === 'action') data.completed_action = itemId;
      
      const response = await axios.patch(
        `${API}/workbooks/${workbookId}/progress`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.completed) {
        toast.success("Congratulations! Workbook completed! +50 points", { duration: 5000 });
      } else {
        toast.success("Progress saved!");
      }
      
      loadData();
      
      // Update selected workbook
      const updated = await axios.get(`${API}/workbooks/${workbookId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSelectedWorkbook(updated.data);
    } catch (error) {
      toast.error("Failed to save progress");
    }
  };

  const answeredCount = flashcards.filter(fc => fc.user_answer).length;
  const getCategoryConfig = (category) => CATEGORY_CONFIG[category] || { icon: BookOpen, color: "gray", label: category };

  return (
    <div className="min-h-screen oz-gradient" data-testid="workbook-page">
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
                <Button onClick={() => navigate("/directory")} variant="ghost" className="w-full justify-start text-lg hover:bg-amber-50">Resource Directory</Button>
                <Button onClick={() => navigate("/resources")} variant="ghost" className="w-full justify-start text-lg hover:bg-rose-50">Resources Map</Button>
                <Button onClick={() => navigate("/vault")} variant="ghost" className="w-full justify-start text-lg hover:bg-purple-50">The Vault</Button>
                <Button onClick={() => navigate("/workbook")} variant="ghost" className="w-full justify-start text-lg bg-blue-50">My Workbook</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start text-lg hover:bg-pink-50">My Dossier</Button>
                <hr className="my-4" />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-lg text-red-600 hover:bg-red-50">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-2xl font-bold text-white gold-text" style={{fontFamily: 'Cinzel, serif'}}>My Workbook</h1>
            <p className="text-xs text-emerald-100">Personalized learning journey</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Stats Card */}
          <Card className="bg-white/95 backdrop-blur-lg border-2 border-yellow-300 shadow-xl mb-8">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-amber-700">Level {stats.level}</CardTitle>
                    <p className="text-gray-600">{stats.total_points} points earned</p>
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-emerald-600">{stats.completed_workbooks || 0}</p>
                    <p className="text-xs text-gray-600">Workbooks Done</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{answeredCount}/{flashcards.length}</p>
                    <p className="text-xs text-gray-600">Flashcards</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Level {stats.level + 1}</span>
                  <span>{stats.total_points % 100}/100 points</span>
                </div>
                <Progress value={(stats.total_points % 100)} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white/80">
              <TabsTrigger value="workbooks" data-testid="tab-workbooks" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <GraduationCap className="w-4 h-4 mr-2" />
                Workbooks ({workbooks.length})
              </TabsTrigger>
              <TabsTrigger value="flashcards" data-testid="tab-flashcards" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Flashcards ({answeredCount}/{flashcards.length})
              </TabsTrigger>
            </TabsList>

            {/* WORKBOOKS TAB */}
            <TabsContent value="workbooks">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
                  <p className="text-white">Loading your workbooks...</p>
                </div>
              ) : workbooks.length === 0 ? (
                <Card className="bg-white/95 border-2 border-emerald-200">
                  <CardContent className="text-center py-12">
                    <Brain className="h-20 w-20 text-emerald-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Learn?</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      BRICK will create personalized workbooks just for you based on your flashcard answers and conversations. 
                      Topics include cooking, budgeting, spotting scams, recognizing manipulation, and much more!
                    </p>
                    {answeredCount < 3 ? (
                      <div className="space-y-4">
                        <p className="text-amber-600 font-medium">Complete at least 3 flashcards first so BRICK can understand your needs.</p>
                        <Button onClick={() => setActiveTab("flashcards")} className="btn-emerald">
                          <Sparkles className="mr-2 h-4 w-4" />
                          Answer Flashcards
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={generateWorkbooks} disabled={generating} className="btn-emerald text-lg px-8 py-6">
                        {generating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            BRICK is creating your workbooks...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-5 w-5" />
                            Generate My Personalized Workbooks
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Generate More Button */}
                  <div className="flex justify-end">
                    <Button onClick={generateWorkbooks} disabled={generating} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                      Generate More Workbooks
                    </Button>
                  </div>
                  
                  {/* Workbook Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {workbooks.map(workbook => {
                      const config = getCategoryConfig(workbook.category);
                      const Icon = config.icon;
                      const isComplete = workbook.progress >= 100;
                      
                      return (
                        <Card 
                          key={workbook.id}
                          className={`bg-white/95 border-2 cursor-pointer transition-all hover:shadow-xl ${
                            isComplete ? 'border-green-300 bg-green-50/50' : 'border-gray-200 hover:border-emerald-300'
                          }`}
                          onClick={() => setSelectedWorkbook(workbook)}
                          data-testid={`workbook-card-${workbook.id}`}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-4">
                              <div className={`w-14 h-14 bg-${config.color}-100 rounded-xl flex items-center justify-center`}>
                                <Icon className={`h-7 w-7 text-${config.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CardTitle className="text-lg">{workbook.title}</CardTitle>
                                  {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
                                </div>
                                <Badge variant="secondary" className="capitalize">{config.label}</Badge>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workbook.why_recommended}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium">{workbook.progress}%</span>
                              </div>
                              <Progress value={workbook.progress} className="h-2" />
                            </div>
                            <div className="flex gap-4 mt-4 text-xs text-gray-500">
                              <span>{workbook.lessons?.length || 0} lessons</span>
                              <span>{workbook.exercises?.length || 0} exercises</span>
                              <span>{workbook.action_items?.length || 0} actions</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* FLASHCARDS TAB */}
            <TabsContent value="flashcards">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-white">Loading flashcards...</p>
                </div>
              ) : currentFlashcard ? (
                <Card className="bg-white/95 border-2 border-blue-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500 text-white capitalize">{currentFlashcard.category}</Badge>
                      <p className="text-sm text-gray-600">{answeredCount + 1} of {flashcards.length}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <p className="text-xl font-medium text-gray-800">{currentFlashcard.question}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Select your answer:
                      </Label>
                      <RadioGroup value={flashcardAnswer} onValueChange={setFlashcardAnswer}>
                        <div className="space-y-3">
                          {currentFlashcard.answer_options?.map((option, idx) => (
                            <div 
                              key={idx} 
                              className={`flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                flashcardAnswer === option 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                              }`}
                              onClick={() => setFlashcardAnswer(option)}
                            >
                              <RadioGroupItem value={option} id={`option-${idx}`} />
                              <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-normal text-gray-700">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </div>
                    <Button
                      onClick={submitFlashcardAnswer}
                      disabled={!flashcardAnswer}
                      className="w-full btn-emerald py-6 text-lg"
                      data-testid="submit-flashcard-btn"
                    >
                      Submit Answer
                    </Button>
                    <p className="text-sm text-gray-500 text-center bg-amber-50 p-3 rounded-lg border border-amber-200">
                      Your answers help BRICK create personalized workbooks just for you!
                    </p>
                  </CardContent>
                </Card>
              ) : flashcards.length > 0 ? (
                <Card className="bg-white/95 border-2 border-green-300">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">All Flashcards Completed!</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Great work! You've answered all {flashcards.length} flashcards. 
                      BRICK now understands your situation and can create personalized workbooks.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button onClick={() => setActiveTab("workbooks")} className="btn-emerald">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        View Workbooks
                      </Button>
                      <Button onClick={() => navigate("/dossier")} variant="outline">
                        View Your Dossier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/95 border-2 border-gray-200">
                  <CardContent className="text-center py-12">
                    <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Flashcards Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Register a new account to receive personalized flashcards!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Workbook Detail Dialog */}
      <Dialog open={!!selectedWorkbook} onOpenChange={(open) => !open && setSelectedWorkbook(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedWorkbook && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedWorkbook(null)}>
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div>
                    <DialogTitle className="text-2xl">{selectedWorkbook.title}</DialogTitle>
                    <DialogDescription>{selectedWorkbook.description}</DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <Progress value={selectedWorkbook.progress} className="flex-1 h-3" />
                  <span className="font-bold text-emerald-600">{selectedWorkbook.progress}%</span>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Why This Workbook */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Why BRICK recommended this:</strong> {selectedWorkbook.why_recommended}
                  </p>
                </div>

                {/* Lessons */}
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <BookMarked className="h-5 w-5 text-blue-600" />
                    Lessons
                  </h3>
                  <div className="space-y-4">
                    {selectedWorkbook.lessons?.map((lesson, idx) => {
                      const isCompleted = selectedWorkbook.completed_lessons?.includes(lesson.id);
                      return (
                        <Card key={idx} className={`border ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base flex items-center gap-2">
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-300" />
                                )}
                                Lesson {idx + 1}: {lesson.title}
                              </CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-700 mb-4 whitespace-pre-line">{lesson.content}</p>
                            {lesson.key_points && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="font-semibold text-blue-800 mb-2">Key Points:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {lesson.key_points.map((point, i) => (
                                    <li key={i} className="text-blue-700 text-sm">{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {!isCompleted && (
                              <Button 
                                className="mt-4 btn-emerald"
                                onClick={() => updateWorkbookProgress(selectedWorkbook.id, 'lesson', lesson.id)}
                              >
                                Mark as Complete
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Exercises */}
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-purple-600" />
                    Exercises
                  </h3>
                  <div className="space-y-4">
                    {selectedWorkbook.exercises?.map((exercise, idx) => {
                      const isCompleted = selectedWorkbook.completed_exercises?.includes(exercise.id);
                      return (
                        <Card key={idx} className={`border ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-300 mt-1" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium mb-3">{exercise.question}</p>
                                {exercise.options && (
                                  <div className="space-y-2 mb-4">
                                    {exercise.options.map((opt, i) => (
                                      <div key={i} className={`p-3 rounded-lg border ${
                                        isCompleted && opt === exercise.correct_answer 
                                          ? 'bg-green-100 border-green-300' 
                                          : 'bg-gray-50 border-gray-200'
                                      }`}>
                                        {opt}
                                        {isCompleted && opt === exercise.correct_answer && (
                                          <span className="ml-2 text-green-600 text-sm">✓ Correct</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {isCompleted && exercise.explanation && (
                                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                                    <strong>Explanation:</strong> {exercise.explanation}
                                  </div>
                                )}
                                {!isCompleted && (
                                  <Button 
                                    size="sm"
                                    onClick={() => updateWorkbookProgress(selectedWorkbook.id, 'exercise', exercise.id)}
                                  >
                                    I've Completed This
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Action Items */}
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    Action Items (Do This Week!)
                  </h3>
                  <div className="space-y-3">
                    {selectedWorkbook.action_items?.map((action, idx) => {
                      const actionId = `action_${idx}`;
                      const isCompleted = selectedWorkbook.completed_actions?.includes(actionId);
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                            isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <Checkbox 
                            checked={isCompleted}
                            onCheckedChange={() => !isCompleted && updateWorkbookProgress(selectedWorkbook.id, 'action', actionId)}
                          />
                          <span className={isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}>{action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Resources */}
                {selectedWorkbook.resources?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                      <ExternalLink className="h-5 w-5 text-indigo-600" />
                      Helpful Resources
                    </h3>
                    <div className="space-y-3">
                      {selectedWorkbook.resources.map((resource, idx) => (
                        <a 
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                          <p className="font-medium text-indigo-800">{resource.title}</p>
                          {resource.description && (
                            <p className="text-sm text-indigo-600 mt-1">{resource.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
