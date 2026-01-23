import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Menu, BookOpen, Award, CheckCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Workbook() {
  const { user, token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total_tasks: 0, completed_tasks: 0, total_points: 0, level: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        axios.get(`${API}/workbook/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/workbook/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to load workbook");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId, answer = null) => {
    try {
      await axios.patch(
        `${API}/workbook/tasks/${taskId}/complete`,
        { answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Task completed! +10 points");
      loadData();
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

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
            <p className="text-xs text-gray-500">Personalized learning tasks</p>
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

          {/* Tasks */}
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
        </div>
      </div>
    </div>
  );
}
