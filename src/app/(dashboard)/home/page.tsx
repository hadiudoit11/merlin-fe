'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Plus,
  LayoutDashboard,
  CheckSquare,
  FileText,
  Video,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Mock data for demonstration
const recentCanvases = [
  { id: 1, name: 'Q1 Product Strategy', updated: '2 hours ago', nodes: 12 },
  { id: 2, name: 'Mobile App PRD', updated: '5 hours ago', nodes: 8 },
  { id: 3, name: 'API v2 Planning', updated: '1 day ago', nodes: 15 },
];

const tasksDueToday = [
  { id: 1, title: 'Review PRD for Q1 launch', priority: 'high', source: 'manual' },
  { id: 2, title: 'Update metrics dashboard', priority: 'medium', source: 'zoom' },
  { id: 3, title: 'Respond to stakeholder feedback', priority: 'low', source: 'slack' },
];

const upcomingMeetings = [
  { id: 1, title: 'Sprint Planning', time: '2:00 PM', duration: '1h' },
  { id: 2, title: 'Design Review', time: '4:00 PM', duration: '30m' },
];

const teamActivity = [
  { id: 1, user: 'Sarah', action: 'created', target: 'Mobile App PRD', time: '10m ago' },
  { id: 2, user: 'Mike', action: 'moved task to', target: 'Done', time: '25m ago' },
  { id: 3, user: 'Alex', action: 'commented on', target: 'Q1 OKR', time: '1h ago' },
];

export default function DashboardHomePage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(' ')[0] || 'there';
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold font-headline">
          {greeting}, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what needs your attention today.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/canvas">
            <Plus className="h-4 w-4 mr-2" />
            New Canvas
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/tasks">
            <CheckSquare className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/documents">
            <FileText className="h-4 w-4 mr-2" />
            New Document
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/meetings">
            <Video className="h-4 w-4 mr-2" />
            Import Meeting
          </Link>
        </Button>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Canvases */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Canvases</CardTitle>
                <CardDescription>Your recent workspaces</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/canvas">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCanvases.map((canvas) => (
                  <Link
                    key={canvas.id}
                    href={`/canvas/${canvas.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {canvas.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {canvas.nodes} nodes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {canvas.updated}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks Due Today */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Due Today</CardTitle>
                <CardDescription>{tasksDueToday.length} tasks</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tasks">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasksDueToday.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <CheckSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            task.priority === 'high'
                              ? 'destructive'
                              : task.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {task.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Meetings */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Upcoming</CardTitle>
                <CardDescription>Today&apos;s meetings</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/meetings">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meeting.time} ({meeting.duration})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Team Activity</CardTitle>
              <CardDescription>What your team has been up to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-muted">
                        {activity.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium text-primary">{activity.target}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm">
                    <span className="font-medium">3 objectives</span> are missing key results.
                    Consider adding measurable outcomes.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm">
                    <span className="font-medium">Sprint velocity</span> is trending up 12% this
                    quarter.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/agents">
                    Open AI Assistant
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
