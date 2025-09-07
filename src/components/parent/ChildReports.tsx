import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Calendar, TrendingUp, Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { User } from '../../App';
import { projectId } from '../../utils/supabase/info';

interface ChildReport {
  id: string;
  report_type: string;
  title: string;
  content: string;
  assessment_date: string;
  created_at: string;
  progress_areas: {
    area: string;
    score: number;
    notes: string;
  }[];
  overall_rating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
}

interface ChildReportsProps {
  user: User;
}

const RATING_COLORS = {
  excellent: 'text-green-600 bg-green-50 border-green-200',
  good: 'text-blue-600 bg-blue-50 border-blue-200',
  satisfactory: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  needs_improvement: 'text-red-600 bg-red-50 border-red-200'
};

const RATING_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  satisfactory: 'Satisfactory',
  needs_improvement: 'Needs Improvement'
};

export function ChildReports({ user }: ChildReportsProps) {
  const [reports, setReports] = useState<ChildReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ChildReport | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      // For demo purposes, using mock data
      // In real implementation, this would fetch child-specific reports
      const mockReports: ChildReport[] = [
        {
          id: '1',
          report_type: 'Monthly Progress',
          title: 'January 2024 Progress Report',
          content: 'Emma has shown remarkable growth in language development this month. She demonstrates excellent communication skills and has developed a strong interest in reading. Her social interactions with peers are positive and she shows leadership qualities during group activities.',
          assessment_date: '2024-01-31',
          created_at: '2024-02-01T10:00:00Z',
          progress_areas: [
            { area: 'Language Development', score: 95, notes: 'Excellent vocabulary growth and reading comprehension' },
            { area: 'Mathematical Thinking', score: 85, notes: 'Good understanding of number concepts and patterns' },
            { area: 'Social Skills', score: 92, notes: 'Shows empathy and cooperates well with others' },
            { area: 'Physical Development', score: 88, notes: 'Good fine motor skills, improving gross motor coordination' },
            { area: 'Creative Expression', score: 90, notes: 'Shows creativity in art and music activities' }
          ],
          overall_rating: 'excellent'
        },
        {
          id: '2',
          report_type: 'Behavioral Assessment',
          title: 'Social and Emotional Development Assessment',
          content: 'Emma demonstrates strong emotional regulation and social awareness. She is kind and considerate to her classmates and shows independence in her daily activities. She seeks help when needed and offers assistance to others.',
          assessment_date: '2024-01-15',
          created_at: '2024-01-16T14:30:00Z',
          progress_areas: [
            { area: 'Emotional Regulation', score: 88, notes: 'Manages emotions well, rarely has outbursts' },
            { area: 'Social Interaction', score: 92, notes: 'Plays cooperatively and shows empathy' },
            { area: 'Independence', score: 85, notes: 'Takes care of personal needs, follows routines' },
            { area: 'Attention & Focus', score: 80, notes: 'Good attention span for age, improving concentration' },
            { area: 'Following Directions', score: 90, notes: 'Listens well and follows multi-step instructions' }
          ],
          overall_rating: 'good'
        },
        {
          id: '3',
          report_type: 'Academic Evaluation',
          title: 'Mid-Year Academic Progress',
          content: 'Emma is meeting all developmental milestones for her age group. She shows particular strength in language arts and demonstrates curiosity about the world around her. She approaches new challenges with enthusiasm and persistence.',
          assessment_date: '2024-01-01',
          created_at: '2024-01-02T09:00:00Z',
          progress_areas: [
            { area: 'Pre-Reading Skills', score: 93, notes: 'Recognizes letters, understands phonics basics' },
            { area: 'Pre-Math Skills', score: 82, notes: 'Counts to 20, understands basic addition concepts' },
            { area: 'Science Curiosity', score: 89, notes: 'Asks thoughtful questions, enjoys experiments' },
            { area: 'Cultural Awareness', score: 87, notes: 'Shows interest in different cultures and traditions' },
            { area: 'Problem Solving', score: 85, notes: 'Works through challenges methodically' }
          ],
          overall_rating: 'excellent'
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching child reports:', error);
    } finally {
      setLoading(false);
    }
  }

  function getOverallScore(progressAreas: ChildReport['progress_areas']): number {
    if (progressAreas.length === 0) return 0;
    return Math.round(progressAreas.reduce((sum, area) => sum + area.score, 0) / progressAreas.length);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function downloadReport(report: ChildReport) {
    // Mock download functionality
    console.log(`Downloading report: ${report.title}`);
    // In real implementation, this would generate and download a PDF
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  const latestReport = reports[0];
  const overallProgress = latestReport ? getOverallScore(latestReport.progress_areas) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Child Reports</h2>
        <p className="text-muted-foreground">
          View your child's progress reports and assessments
        </p>
      </div>

      {/* Latest Report Summary */}
      {latestReport && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-blue-900">Latest Progress Summary</CardTitle>
                <CardDescription className="text-blue-700">
                  {latestReport.title} • {formatDate(latestReport.assessment_date)}
                </CardDescription>
              </div>
              <Badge 
                className={`${RATING_COLORS[latestReport.overall_rating]} border`}
              >
                {RATING_LABELS[latestReport.overall_rating]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Score Circle */}
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgb(219, 234, 254)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="8"
                    strokeDasharray={`${overallProgress * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{overallProgress}%</div>
                    <div className="text-sm text-blue-700">Overall</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Areas */}
            <div className="space-y-3">
              {latestReport.progress_areas.slice(0, 3).map(area => (
                <div key={area.area} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">{area.area}</span>
                    <span className="text-sm text-blue-700">{area.score}%</span>
                  </div>
                  <Progress value={area.score} className="h-2" />
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedReport(latestReport)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{latestReport.title}</DialogTitle>
                    <DialogDescription>
                      Assessment Date: {formatDate(latestReport.assessment_date)}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{overallProgress}%</div>
                          <div className="text-sm text-muted-foreground">Overall Score</div>
                        </div>
                        <Badge 
                          className={`${RATING_COLORS[latestReport.overall_rating]} border`}
                        >
                          {RATING_LABELS[latestReport.overall_rating]}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadReport(latestReport)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Teacher's Comments</h4>
                      <p className="text-sm leading-relaxed bg-white p-4 rounded-lg border">
                        {latestReport.content}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Detailed Progress Areas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {latestReport.progress_areas.map(area => (
                          <Card key={area.area}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">{area.area}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Progress value={area.score} className="flex-1 mr-3" />
                                <span className="text-lg font-bold">{area.score}%</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{area.notes}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Reports History
          </CardTitle>
          <CardDescription>All assessment reports and progress updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {report.report_type} • {formatDate(report.assessment_date)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline"
                        className={RATING_COLORS[report.overall_rating]}
                      >
                        {RATING_LABELS[report.overall_rating]}
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold">{getOverallScore(report.progress_areas)}%</div>
                        <div className="text-xs text-muted-foreground">Overall</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {report.progress_areas.slice(0, 3).map(area => (
                      <div key={area.area} className="flex items-center space-x-2 text-xs">
                        <span className="text-muted-foreground">{area.area}:</span>
                        <Badge variant="secondary">{area.score}%</Badge>
                      </div>
                    ))}
                    {report.progress_areas.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{report.progress_areas.length - 3} more areas
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      Created: {formatDate(report.created_at)}
                    </span>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{report.title}</DialogTitle>
                            <DialogDescription>
                              Assessment Date: {formatDate(report.assessment_date)}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold">{getOverallScore(report.progress_areas)}%</div>
                                  <div className="text-sm text-muted-foreground">Overall Score</div>
                                </div>
                                <Badge 
                                  className={`${RATING_COLORS[report.overall_rating]} border`}
                                >
                                  {RATING_LABELS[report.overall_rating]}
                                </Badge>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadReport(report)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </Button>
                            </div>

                            <div>
                              <h4 className="font-medium mb-3">Teacher's Comments</h4>
                              <p className="text-sm leading-relaxed bg-white p-4 rounded-lg border">
                                {report.content}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-4">Detailed Progress Areas</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.progress_areas.map(area => (
                                  <Card key={area.area}>
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-base">{area.area}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <Progress value={area.score} className="flex-1 mr-3" />
                                        <span className="text-lg font-bold">{area.score}%</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{area.notes}</p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Progress Trends
          </CardTitle>
          <CardDescription>
            Your child's development over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">📈</div>
              <div className="text-lg font-medium">Language Development</div>
              <div className="text-sm text-muted-foreground">Consistently improving</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">🧮</div>
              <div className="text-lg font-medium">Mathematical Thinking</div>
              <div className="text-sm text-muted-foreground">Steady progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">🤝</div>
              <div className="text-lg font-medium">Social Skills</div>
              <div className="text-sm text-muted-foreground">Excellent development</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {reports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports available</h3>
            <p className="text-muted-foreground text-center">
              Reports will appear here as teachers create progress assessments for your child.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}