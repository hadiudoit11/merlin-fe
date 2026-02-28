'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  LayoutGrid,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { Canvas, CanvasNode } from '@/types/canvas';

interface MetricData {
  id: number;
  name: string;
  content: string;
  canvasId: number;
  canvasName: string;
  value?: number;
  target?: number;
  previousValue?: number;
  trend: 'up' | 'down' | 'stable';
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  unit?: string;
  color: string;
}

interface KeyResultData {
  id: number;
  name: string;
  content: string;
  canvasId: number;
  canvasName: string;
  progress: number;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed', '#6d28d9'];

const statusColors = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  behind: 'bg-red-500',
  completed: 'bg-blue-500',
};

const statusLabels = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  behind: 'Behind',
  completed: 'Completed',
};

// Mock trend data for charts
const generateTrendData = (baseValue: number, days: number = 30): Array<{ day: number; value: number; date: string }> => {
  const data: Array<{ day: number; value: number; date: string }> = [];
  let value = baseValue * 0.7;
  for (let i = 0; i < days; i++) {
    value += (Math.random() - 0.3) * (baseValue * 0.05);
    value = Math.max(0, Math.min(baseValue * 1.2, value));
    data.push({
      day: i + 1,
      value: Math.round(value * 100) / 100,
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return data;
};

function MetricCard({ metric, index }: { metric: MetricData; index: number }) {
  const trendData = useMemo(() => generateTrendData(metric.value || 100, 14), [metric.value]);
  const trendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const percentChange = metric.previousValue
    ? Math.round(((metric.value || 0) - metric.previousValue) / metric.previousValue * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardDescription className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  {metric.canvasName}
                </span>
              </CardDescription>
              <CardTitle className="text-base font-medium line-clamp-1">{metric.name}</CardTitle>
            </div>
            <div className={`p-2 rounded-lg ${statusColors[metric.status]}/10`}>
              <Activity className={`h-4 w-4 ${statusColors[metric.status].replace('bg-', 'text-')}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-3xl font-bold">
                {metric.value?.toLocaleString() || 'N/A'}
                {metric.unit && <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>}
              </div>
              {metric.target && (
                <div className="text-sm text-muted-foreground">
                  Target: {metric.target.toLocaleString()}{metric.unit}
                </div>
              )}
            </div>
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{Math.abs(percentChange)}%</span>
            </div>
          </div>

          {/* Mini sparkline */}
          <div className="h-12 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id={`gradient-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill={`url(#gradient-${metric.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function KeyResultCard({ kr, index }: { kr: KeyResultData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
    >
      <div className={`h-2 w-2 rounded-full ${statusColors[kr.status]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{kr.name}</span>
          <Badge variant="outline" className="text-xs shrink-0">
            {kr.canvasName}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={kr.progress} className="flex-1 h-2" />
          <span className="text-sm font-medium text-muted-foreground w-12 text-right">
            {kr.progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = 'violet'
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                changeType === 'positive' ? 'text-emerald-500' :
                changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
              }`}>
                {changeType === 'positive' ? <ArrowUpRight className="h-3 w-3" /> :
                 changeType === 'negative' ? <ArrowDownRight className="h-3 w-3" /> : null}
                {change}
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricsDashboard() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResultData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCanvas, setSelectedCanvas] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const canvasesData = await api.listCanvases();
      setCanvases(canvasesData);

      const allMetrics: MetricData[] = [];
      const allKeyResults: KeyResultData[] = [];

      // Fetch nodes from each canvas
      for (const canvas of canvasesData) {
        try {
          const canvasDetail = await api.getCanvas(canvas.id);
          const nodes = canvasDetail.nodes || [];

          // Extract metrics
          nodes.filter(n => n.node_type === 'metric').forEach(node => {
            const config = node.config as any;
            allMetrics.push({
              id: node.id,
              name: node.name,
              content: node.content,
              canvasId: canvas.id,
              canvasName: canvas.name,
              value: config?.value || Math.round(Math.random() * 1000),
              target: config?.targetValue || Math.round(Math.random() * 1200),
              previousValue: config?.previousValue || Math.round(Math.random() * 900),
              trend: config?.trend || ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
              status: config?.status || ['on_track', 'at_risk', 'behind', 'completed'][Math.floor(Math.random() * 4)] as any,
              unit: config?.unit || '%',
              color: node.color,
            });
          });

          // Extract key results
          nodes.filter(n => n.node_type === 'keyresult').forEach(node => {
            const config = node.config as any;
            const current = config?.currentValue || Math.random() * 100;
            const target = config?.targetValue || 100;
            allKeyResults.push({
              id: node.id,
              name: node.name,
              content: node.content,
              canvasId: canvas.id,
              canvasName: canvas.name,
              progress: Math.round((current / target) * 100),
              status: config?.status || ['on_track', 'at_risk', 'behind', 'completed'][Math.floor(Math.random() * 4)] as any,
            });
          });
        } catch (err) {
          console.error(`Failed to load canvas ${canvas.id}:`, err);
        }
      }

      setMetrics(allMetrics);
      setKeyResults(allKeyResults);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMetrics = selectedCanvas === 'all'
    ? metrics
    : metrics.filter(m => m.canvasId === Number(selectedCanvas));

  const filteredKeyResults = selectedCanvas === 'all'
    ? keyResults
    : keyResults.filter(kr => kr.canvasId === Number(selectedCanvas));

  // Calculate summary stats
  const stats = useMemo(() => {
    const onTrack = [...filteredMetrics, ...filteredKeyResults].filter(m => m.status === 'on_track').length;
    const atRisk = [...filteredMetrics, ...filteredKeyResults].filter(m => m.status === 'at_risk').length;
    const behind = [...filteredMetrics, ...filteredKeyResults].filter(m => m.status === 'behind').length;
    const completed = [...filteredMetrics, ...filteredKeyResults].filter(m => m.status === 'completed').length;
    const total = filteredMetrics.length + filteredKeyResults.length;

    return { onTrack, atRisk, behind, completed, total };
  }, [filteredMetrics, filteredKeyResults]);

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'On Track', value: stats.onTrack, color: '#10b981' },
    { name: 'At Risk', value: stats.atRisk, color: '#f59e0b' },
    { name: 'Behind', value: stats.behind, color: '#ef4444' },
    { name: 'Completed', value: stats.completed, color: '#3b82f6' },
  ].filter(s => s.value > 0);

  // Performance over time data
  const performanceData = useMemo((): Array<{ month: string; metrics: number; keyResults: number }> => {
    const data: Array<{ month: string; metrics: number; keyResults: number }> = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
        metrics: Math.round(60 + Math.random() * 30),
        keyResults: Math.round(50 + Math.random() * 40),
      });
    }
    return data;
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Metrics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track performance across all your canvases
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedCanvas} onValueChange={setSelectedCanvas}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Canvases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Canvases</SelectItem>
              {canvases.map(canvas => (
                <SelectItem key={canvas.id} value={String(canvas.id)}>
                  {canvas.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4"
      >
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.onTrack}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-3xl font-bold text-amber-600">{stats.atRisk}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Behind</p>
                <p className="text-3xl font-bold text-red-600">{stats.behind}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Metrics and Key Results completion over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorMetrics" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorKR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="metrics"
                      name="Metrics"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#colorMetrics)"
                    />
                    <Area
                      type="monotone"
                      dataKey="keyResults"
                      name="Key Results"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      fill="url(#colorKR)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Overall health of your OKRs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {statusDistribution.map((status) => (
                  <div key={status.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {status.name} ({status.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">All Metrics</h2>
          <Badge variant="secondary">{filteredMetrics.length} metrics</Badge>
        </div>

        {filteredMetrics.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No metrics found</h3>
              <p className="text-muted-foreground text-center">
                Add metric nodes to your canvases to see them here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMetrics.map((metric, index) => (
              <MetricCard key={metric.id} metric={metric} index={index} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Key Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Key Results Progress</h2>
          <Badge variant="secondary">{filteredKeyResults.length} key results</Badge>
        </div>

        {filteredKeyResults.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No key results found</h3>
              <p className="text-muted-foreground text-center">
                Add key result nodes to your canvases to track progress
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-2">
              {filteredKeyResults.map((kr, index) => (
                <KeyResultCard key={kr.id} kr={kr} index={index} />
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
