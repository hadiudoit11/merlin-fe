'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus,
  Search,
  Bot,
  MoreVertical,
  Settings,
  Trash2,
  Play,
  Pause,
  Copy,
  MessageSquare,
  Zap,
  Brain,
  Clock,
  Activity,
  LayoutGrid,
  List,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string;
  model: string;
  status: 'active' | 'inactive' | 'draft';
  type: 'assistant' | 'researcher' | 'coder' | 'analyst' | 'custom';
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  conversations: number;
  isPublic: boolean;
}

const AGENT_TYPES = [
  { value: 'assistant', label: 'General Assistant', icon: '🤖', description: 'Helpful for general tasks and questions' },
  { value: 'researcher', label: 'Researcher', icon: '🔍', description: 'Deep research and analysis' },
  { value: 'coder', label: 'Coder', icon: '💻', description: 'Code generation and debugging' },
  { value: 'analyst', label: 'Analyst', icon: '📊', description: 'Data analysis and insights' },
  { value: 'custom', label: 'Custom', icon: '⚙️', description: 'Build your own agent' },
];

const MODELS = [
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Most capable' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fastest' },
];

const AGENT_ICONS = ['🤖', '🧠', '💡', '🔮', '🎯', '⚡', '🚀', '🔧', '📚', '🎨', '🔬', '🌟'];
const AGENT_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16'];

const STORAGE_KEY = 'merlin_agents';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AgentCard({ agent, onDelete, onToggleStatus }: {
  agent: Agent;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) {
  const statusColors = {
    active: 'bg-emerald-500',
    inactive: 'bg-gray-400',
    draft: 'bg-amber-500',
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="group hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${agent.color}20` }}
              >
                {agent.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <div className={`h-2 w-2 rounded-full ${statusColors[agent.status]}`} />
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {AGENT_TYPES.find(t => t.value === agent.type)?.label || 'Custom'}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/agents/${agent.id}/chat`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/agents/${agent.id}/settings`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(agent.id)}>
                  {agent.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(agent.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {agent.description || 'No description'}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {agent.conversations}
              </span>
              {agent.lastUsed && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(agent.lastUsed).toLocaleDateString()}
                </span>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {agent.model.split('-').pop()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    instructions: '',
    type: 'assistant',
    model: 'claude-3-sonnet',
    icon: '🤖',
    color: '#8b5cf6',
    isPublic: false,
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAgents(JSON.parse(stored));
      } else {
        // Seed with sample agents
        const sampleAgents: Agent[] = [
          {
            id: 'agent-1',
            name: 'Research Assistant',
            description: 'Helps with deep research, summarizing documents, and finding information',
            instructions: 'You are a research assistant. Help users find information, summarize documents, and provide well-sourced answers.',
            model: 'claude-3-sonnet',
            status: 'active',
            type: 'researcher',
            icon: '🔍',
            color: '#06b6d4',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            conversations: 24,
            isPublic: false,
          },
          {
            id: 'agent-2',
            name: 'Code Helper',
            description: 'Expert at writing, reviewing, and debugging code across multiple languages',
            instructions: 'You are a coding expert. Help users write clean, efficient code. Review code for bugs and suggest improvements.',
            model: 'claude-3-opus',
            status: 'active',
            type: 'coder',
            icon: '💻',
            color: '#10b981',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            conversations: 87,
            isPublic: true,
          },
        ];
        setAgents(sampleAgents);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleAgents));
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAgents = (updatedAgents: Agent[]) => {
    setAgents(updatedAgents);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAgents));
  };

  const handleCreateAgent = () => {
    if (!newAgent.name.trim()) return;

    const agent: Agent = {
      id: `agent-${Date.now()}`,
      ...newAgent,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversations: 0,
    };

    saveAgents([...agents, agent]);
    setShowCreateDialog(false);
    setCreateStep(1);
    setNewAgent({
      name: '',
      description: '',
      instructions: '',
      type: 'assistant',
      model: 'claude-3-sonnet',
      icon: '🤖',
      color: '#8b5cf6',
      isPublic: false,
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    saveAgents(agents.filter(a => a.id !== agentId));
  };

  const handleToggleStatus = (agentId: string) => {
    saveAgents(
      agents.map(a =>
        a.id === agentId
          ? { ...a, status: a.status === 'active' ? 'inactive' : 'active', updatedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const filteredAgents = agents
    .filter(a => {
      if (filterType !== 'all' && a.type !== filterType) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(query) || a.description.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24 mt-1" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
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
          <h1 className="text-3xl font-bold">Agents</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage AI agents for specific tasks
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                {createStep === 1 ? 'Choose a type and give your agent a name' : 'Configure your agent\'s behavior'}
              </DialogDescription>
            </DialogHeader>

            {createStep === 1 ? (
              <div className="space-y-6 py-4">
                {/* Agent Type */}
                <div className="space-y-3">
                  <Label>Agent Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AGENT_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setNewAgent(prev => ({ ...prev, type: type.value, icon: type.icon }))}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          newAgent.type === type.value
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                            : 'border-transparent bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon & Color */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <div className="flex flex-wrap gap-2">
                      {AGENT_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setNewAgent(prev => ({ ...prev, icon }))}
                          className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg border-2 transition-colors ${
                            newAgent.icon === icon
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                              : 'border-transparent hover:bg-muted'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex flex-wrap gap-2">
                      {AGENT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewAgent(prev => ({ ...prev, color }))}
                          className={`h-8 w-8 rounded-full transition-all ${
                            newAgent.color === color ? 'ring-2 ring-offset-2 ring-violet-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Name & Description */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="My Agent"
                      value={newAgent.name}
                      onChange={e => setNewAgent(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What does this agent do?"
                      rows={2}
                      value={newAgent.description}
                      onChange={e => setNewAgent(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {/* Model */}
                <div className="space-y-2">
                  <Label>Model</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {MODELS.map(model => (
                      <button
                        key={model.value}
                        onClick={() => setNewAgent(prev => ({ ...prev, model: model.value }))}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          newAgent.model === model.value
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                            : 'border-transparent bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="font-medium text-sm">{model.label}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="You are a helpful assistant that..."
                    rows={6}
                    value={newAgent.instructions}
                    onChange={e => setNewAgent(prev => ({ ...prev, instructions: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define how your agent should behave. Be specific about its role, capabilities, and limitations.
                  </p>
                </div>

                {/* Visibility */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium text-sm">Public Agent</div>
                    <div className="text-xs text-muted-foreground">
                      Allow team members to use this agent
                    </div>
                  </div>
                  <Switch
                    checked={newAgent.isPublic}
                    onCheckedChange={checked => setNewAgent(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              {createStep === 2 && (
                <Button variant="outline" onClick={() => setCreateStep(1)}>
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setCreateStep(1);
              }}>
                Cancel
              </Button>
              {createStep === 1 ? (
                <Button onClick={() => setCreateStep(2)} disabled={!newAgent.name.trim()}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleCreateAgent}>
                  Create Agent
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {AGENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <Activity className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'No agents found'
                : 'No agents yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first agent to get started'}
            </p>
            {!searchQuery && filterType === 'all' && filterStatus === 'all' && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          }
        >
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={handleDeleteAgent}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
