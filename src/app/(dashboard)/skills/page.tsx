'use client';

import React, { useState, useEffect } from 'react';
import {
  Plug,
  Search,
  Filter,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileText,
  MessageSquare,
  Video,
  PenTool,
  Github,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { JiraSkill } from '@/components/skills/JiraSkill';
import { ConfluenceSkill } from '@/components/docs/ConfluenceSkill';
import { skillsApi } from '@/lib/skills-api';
import { Skill, SKILL_PROVIDERS, SkillProvider } from '@/types/skills';

// Mock space for Confluence component (in real app, this would come from context)
const mockSpace = {
  id: 'default-space',
  key: 'default',
  name: 'Default Space',
  description: '',
  icon: '',
  color: '#4ECDC4',
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rootFolderId: 'root',
};

// Skill categories
const categories = [
  { id: 'all', label: 'All', icon: Plug },
  { id: 'tasks', label: 'Tasks', icon: Check },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'communication', label: 'Communication', icon: MessageSquare },
  { id: 'development', label: 'Development', icon: Github },
];

// Available skills with their status
interface SkillCard {
  provider: SkillProvider;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isAvailable: boolean;
  isConnected?: boolean;
  comingSoon?: boolean;
}

export default function SkillsPage() {
  const [connectedSkills, setConnectedSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedSkill, setExpandedSkill] = useState<SkillProvider | null>(null);

  useEffect(() => {
    loadSkills();

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') || params.get('jira')) {
      loadSkills();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const loadSkills = async () => {
    try {
      const skills = await skillsApi.listSkills();
      setConnectedSkills(skills);
    } catch (err) {
      // Backend may not be running - that's OK, we'll show the UI anyway
      console.warn('Failed to load skills (backend may be offline):', err);
      setConnectedSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const skillCards: SkillCard[] = [
    {
      provider: 'jira',
      name: 'Jira',
      description: 'Sync tasks with Jira issues, import via JQL',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M11.5 2C6.25 2 2 6.25 2 11.5C2 16.75 6.25 21 11.5 21C16.75 21 21 16.75 21 11.5C21 6.25 16.75 2 11.5 2Z"
            fill="#2684FF"
          />
          <path d="M11.75 6.5L8.25 10L11.75 13.5V10.5H15.25V9.5H11.75V6.5Z" fill="white" />
          <path d="M11.25 17.5L14.75 14L11.25 10.5V13.5H7.75V14.5H11.25V17.5Z" fill="white" />
        </svg>
      ),
      category: 'tasks',
      isAvailable: true,
    },
    {
      provider: 'confluence',
      name: 'Confluence',
      description: 'Sync pages with Atlassian Confluence',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 12.5C3 12.5 4.5 10 7 10C9.5 10 11 12.5 11 12.5C11 12.5 12.5 15 15 15C17.5 15 19 12.5 19 12.5L21 14C21 14 18.5 18 15 18C11.5 18 9 14 9 14C9 14 6.5 10 4 10L3 12.5Z"
            fill="#2684FF"
          />
          <path
            d="M21 11.5C21 11.5 19.5 14 17 14C14.5 14 13 11.5 13 11.5C13 11.5 11.5 9 9 9C6.5 9 5 11.5 5 11.5L3 10C3 10 5.5 6 9 6C12.5 6 15 10 15 10C15 10 17.5 14 20 14L21 11.5Z"
            fill="#2684FF"
          />
        </svg>
      ),
      category: 'documents',
      isAvailable: true,
    },
    {
      provider: 'slack',
      name: 'Slack',
      description: 'Post updates and receive notifications',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#E01E5A"/>
          <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0"/>
          <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" fill="#2EB67D"/>
          <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
          <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" fill="#ECB22E"/>
          <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
        </svg>
      ),
      category: 'communication',
      isAvailable: true,
    },
    {
      provider: 'notion',
      name: 'Notion',
      description: 'Connect to Notion workspaces',
      icon: (
        <div className="h-8 w-8 bg-black dark:bg-white rounded flex items-center justify-center">
          <span className="text-white dark:text-black text-xl font-bold">N</span>
        </div>
      ),
      category: 'documents',
      isAvailable: false,
      comingSoon: true,
    },
    {
      provider: 'github',
      name: 'GitHub',
      description: 'Link PRs, embed code, sync markdown',
      icon: <Github className="h-8 w-8" />,
      category: 'development',
      isAvailable: false,
      comingSoon: true,
    },
    {
      provider: 'linear',
      name: 'Linear',
      description: 'Sync issues and roadmap items',
      icon: (
        <div className="h-8 w-8 bg-[#5E6AD2] rounded flex items-center justify-center">
          <span className="text-white text-lg font-bold">L</span>
        </div>
      ),
      category: 'tasks',
      isAvailable: false,
      comingSoon: true,
    },
    {
      provider: 'google-docs',
      name: 'Google Docs',
      description: 'Import and sync Google documents',
      icon: (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="#4285F4"/>
          <path d="M14 2V8H20" fill="#A1C2FA"/>
          <path d="M8 13H16V14H8V13ZM8 16H14V17H8V16ZM8 10H16V11H8V10Z" fill="white"/>
        </svg>
      ),
      category: 'documents',
      isAvailable: false,
      comingSoon: true,
    },
  ];

  // Filter skills
  const filteredSkills = skillCards.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if skill is connected
  const isConnected = (provider: SkillProvider) => {
    return connectedSkills.some(
      (item) => item.provider === provider && item.status === 'connected'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plug className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Skills</h1>
        </div>
        <p className="text-muted-foreground">
          Connect your product stack. Sync data bidirectionally with your favorite tools.
        </p>
      </div>

      {/* Connected Skills Summary */}
      {connectedSkills.length > 0 && (
        <div className="mb-8 p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Check className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">
              {connectedSkills.length} Connected Skill
              {connectedSkills.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedSkills.map((item) => {
              const provider = SKILL_PROVIDERS[item.provider];
              return (
                <Badge key={item.id} variant="secondary" className="px-3 py-1">
                  {provider?.icon} {provider?.name || item.provider}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map((skill) => {
          const connected = isConnected(skill.provider);
          const isExpanded = expandedSkill === skill.provider;

          return (
            <Card
              key={skill.provider}
              className={`transition-all ${
                connected ? 'border-emerald-200 dark:border-emerald-800' : ''
              } ${skill.comingSoon ? 'opacity-60' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{skill.icon}</div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {skill.name}
                        {connected && (
                          <Badge variant="outline" className="text-emerald-600 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {skill.comingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {skill.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {skill.isAvailable ? (
                  <Button
                    variant={isExpanded ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() =>
                      setExpandedSkill(isExpanded ? null : skill.provider)
                    }
                  >
                    {connected ? 'Manage' : 'Connect'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                )}

                {/* Expanded Skill Panel */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t">
                    {skill.provider === 'jira' && (
                      <JiraSkill onUpdate={loadSkills} />
                    )}
                    {skill.provider === 'confluence' && (
                      <ConfluenceSkill
                        space={mockSpace}
                        onUpdate={loadSkills}
                      />
                    )}
                    {skill.provider === 'slack' && (
                      <div className="text-center py-4 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Slack skill panel coming soon</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <Plug className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No skills found matching your search.</p>
        </div>
      )}
    </div>
  );
}
