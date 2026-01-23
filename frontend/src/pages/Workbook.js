import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Menu, BookOpen, Award, CheckCircle, Circle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Workbook() {
  const { user, token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(null);
  const [flashcardAnswer, setFlashcardAnswer] = useState("");
  const [stats, setStats] = useState({ total_tasks: 0, completed_tasks: 0, total_points: 0, level: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, statsRes, flashcardsRes] = await Promise.all([
        axios.get(`${API}/workbook/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/workbook/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/flashcards`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      setFlashcards(flashcardsRes.data);
      
      // Set first unanswered flashcard
      const unanswered = flashcardsRes.data.find(fc => !fc.user_answer);
      if (unanswered) setCurrentFlashcard(unanswered);
    } catch (error) {
      toast.error("Failed to load workbook");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.patch(
        `${API}/workbook/tasks/${taskId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Task completed! +10 points");
      loadData();
    } catch (error) {
      toast.error("Failed to complete task");
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
    } catch (error) {
      toast.error("Failed to save answer");
    }
  };

  const answeredCount = flashcards.filter(fc => fc.user_answer).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50" data-testid="workbook-page">
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
                <Button onClick={() => navigate("/vault")} variant="ghost" className="w-full justify-start">The Vault</Button>
                <Button onClick={() => navigate("/workbook")} variant="ghost" className="w-full justify-start bg-blue-50">My Workbook</Button>
                <Button onClick={() => navigate("/legal")} variant="ghost" className="w-full justify-start">Legal Aid</Button>
                <Button onClick={() => navigate("/dossier")} variant="ghost" className="w-full justify-start">My Dossier</Button>
                <hr />
                <Button onClick={logout} variant="ghost" className="w-full justify-start text-red-600">Logout</Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-xl font-bold text-gray-800" data-testid="page-title">My Workbook</h1>
            <p className="text-xs text-gray-500">Personalized learning & flashcards</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Stats Card */}
          <Card className="oz-card border-blue-200 mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-10 w-10 text-blue-600" />
                  <div>
                    <CardTitle className="text-blue-700">Level {stats.level}</CardTitle>
                    <p className="text-sm text-gray-600">{stats.total_points} points earned</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.completed_tasks}/{stats.total_tasks}
                  </p>
                  <p className="text-xs text-gray-600">Tasks Completed</p>
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

          <Tabs defaultValue="flashcards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flashcards" data-testid="tab-flashcards">
                <Sparkles className="w-4 h-4 mr-2" />
                Flashcards ({answeredCount}/{flashcards.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" data-testid="tab-tasks">Tasks ({stats.completed_tasks}/{stats.total_tasks})</TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading flashcards...</p>
                </div>
              ) : currentFlashcard ? (
                <Card className="border-2 border-blue-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500 text-white">{currentFlashcard.category}</Badge>
                      <p className="text-sm text-gray-600">{answeredCount + 1} of {flashcards.length}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <p className="text-lg font-medium text-gray-800">{currentFlashcard.question}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-3 block">
                        Select your answer:
                      </label>
                      <RadioGroup value={flashcardAnswer} onValueChange={setFlashcardAnswer}>
                        <div className="space-y-3">
                          {currentFlashcard.answer_options && currentFlashcard.answer_options.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors" data-testid={`option-${idx}`}>
                              <RadioGroupItem value={option} id={`option-${idx}`} />
                              <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer font-normal">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                      <Button
                        onClick={submitFlashcardAnswer}
                        disabled={!flashcardAnswer}
                        className="w-full btn-emerald mt-4"
                        data-testid="submit-flashcard-btn"
                      >
                        Submit Answer
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      💡 Your answers help BRICK personalize your support and build your dossier
                    </p>
                  </CardContent>
                </Card>
              ) : flashcards.length > 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">All Flashcards Completed!</h3>
                  <p className="text-gray-600 mb-6">
                    Great work! You've answered all {flashcards.length} flashcards. BRICK now has a better understanding of your situation.
                  </p>
                  <Button onClick={() => navigate("/dossier")} className="btn-emerald">
                    View Your Dossier
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Flashcards Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Chat with BRICK AI and flashcards will be generated based on your needs!
                  </p>
                  <Button onClick={() => navigate("/brick")} className="btn-emerald">
                    Talk to BRICK
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tasks">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Tasks Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Chat with BRICK AI to get personalized workbook tasks based on your needs!
                  </p>
                  <Button onClick={() => navigate("/brick")} className="btn-emerald">
                    Talk to BRICK
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <Card key={task.id} className={`border-2 ${task.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'}`} data-testid={`task-card-${task.id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {task.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-400 mt-1" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-base">{task.title}</CardTitle>
                                <Badge variant="outline" className="text-xs">{task.category}</Badge>
                                <Badge className="bg-blue-500 text-white text-xs">+{task.points} pts</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                              {task.completed ? (
                                <p className="text-xs text-green-600 font-medium">
                                  ✓ Completed on {new Date(task.completed_at).toLocaleDateString()}
                                </p>
                              ) : (
                                <Button 
                                  size="sm" 
                                  onClick={() => completeTask(task.id)}
                                  className="btn-emerald"
                                  data-testid={`complete-task-btn-${task.id}`}
                                >
                                  Mark as Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
