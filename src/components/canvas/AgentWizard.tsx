'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  FileText,
  Plug,
  Upload,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Slack,
  FileCode,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { AgentNodeConfig, AgentSkill, AgentDocument, SkillType } from '@/types/canvas';

interface AgentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (name: string, description: string, config: AgentNodeConfig) => void;
}

type WizardStep = 'basics' | 'context-type' | 'documents' | 'skills' | 'review';

const AVAILABLE_SKILLS: AgentSkill[] = [
  {
    type: 'slack',
    name: 'Slack',
    description: 'Connect to Slack channels and messages',
    icon: 'slack',
    connected: false,
  },
  {
    type: 'jira',
    name: 'Jira',
    description: 'Access Jira issues, projects, and boards',
    icon: 'jira',
    connected: false,
  },
  {
    type: 'confluence',
    name: 'Confluence',
    description: 'Search and read Confluence pages',
    icon: 'confluence',
    connected: false,
  },
];

function SkillIcon({ type, className }: { type: SkillType; className?: string }) {
  switch (type) {
    case 'slack':
      return <Slack className={className} />;
    case 'jira':
      return <FileCode className={className} />;
    case 'confluence':
      return <BookOpen className={className} />;
    default:
      return <Plug className={className} />;
  }
}

export function AgentWizard({ isOpen, onClose, onComplete }: AgentWizardProps) {
  const [step, setStep] = useState<WizardStep>('basics');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [contextType, setContextType] = useState<'documents' | 'skills' | null>(null);
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillType[]>([]);
  const [skillConfigs, setSkillConfigs] = useState<Record<string, Record<string, unknown>>>({});

  const resetWizard = useCallback(() => {
    setStep('basics');
    setName('');
    setDescription('');
    setInstructions('');
    setContextType(null);
    setDocuments([]);
    setSelectedSkills([]);
    setSkillConfigs({});
  }, []);

  const handleClose = useCallback(() => {
    resetWizard();
    onClose();
  }, [resetWizard, onClose]);

  const handleNext = useCallback(() => {
    switch (step) {
      case 'basics':
        setStep('context-type');
        break;
      case 'context-type':
        setStep(contextType === 'documents' ? 'documents' : 'skills');
        break;
      case 'documents':
      case 'skills':
        setStep('review');
        break;
    }
  }, [step, contextType]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'context-type':
        setStep('basics');
        break;
      case 'documents':
      case 'skills':
        setStep('context-type');
        break;
      case 'review':
        setStep(contextType === 'documents' ? 'documents' : 'skills');
        break;
    }
  }, [step, contextType]);

  const handleComplete = useCallback(() => {
    const config: AgentNodeConfig = {
      instructions,
      contextType: contextType || 'documents',
      documents: contextType === 'documents' ? documents : undefined,
      skills: contextType === 'skills'
        ? AVAILABLE_SKILLS
            .filter((i) => selectedSkills.includes(i.type))
            .map((i) => ({ ...i, connected: true, config: skillConfigs[i.type] }))
        : undefined,
    };

    onComplete(name, description, config);
    handleClose();
  }, [name, description, instructions, contextType, documents, selectedSkills, skillConfigs, onComplete, handleClose]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newDocs: AgentDocument[] = Array.from(files).map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
  }, []);

  const removeDocument = useCallback((docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }, []);

  const toggleSkill = useCallback((type: SkillType) => {
    setSelectedSkills((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const canProceed = useCallback(() => {
    switch (step) {
      case 'basics':
        return name.trim() !== '' && instructions.trim() !== '';
      case 'context-type':
        return contextType !== null;
      case 'documents':
        return documents.length > 0;
      case 'skills':
        return selectedSkills.length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  }, [step, name, instructions, contextType, documents, selectedSkills]);

  const getStepNumber = () => {
    const steps: WizardStep[] = ['basics', 'context-type', contextType === 'documents' ? 'documents' : 'skills', 'review'];
    return steps.indexOf(step) + 1;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Create Agent
          </DialogTitle>
          <DialogDescription>
            Step {getStepNumber()} of 4 - {step === 'basics' && 'Basic Information'}
            {step === 'context-type' && 'Choose Context Source'}
            {step === 'documents' && 'Upload Documents'}
            {step === 'skills' && 'Connect Skills'}
            {step === 'review' && 'Review & Create'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                s <= getStepNumber() ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Step 1: Basics */}
          {step === 'basics' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name *</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Customer Support Agent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Input
                  id="agent-description"
                  placeholder="A brief description of what this agent does"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-instructions">Instructions *</Label>
                <Textarea
                  id="agent-instructions"
                  placeholder="Tell the agent what it should do, how it should behave, and any specific guidelines to follow..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about the agent's role, tone, and any constraints.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Context Type Selection */}
          {step === 'context-type' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Choose how your agent will access information:
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    contextType === 'documents' && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => setContextType('documents')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload PDFs, docs, or text files for the agent to reference
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary/50',
                    contextType === 'skills' && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => setContextType('skills')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                      <Plug className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Connect Skills</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to Slack, Jira, Confluence via MCP servers
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3a: Documents */}
          {step === 'documents' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOC, DOCX, TXT, MD
                </p>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Documents ({documents.length})</Label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(doc.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {documents.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Upload at least one document to continue</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3b: Skills */}
          {step === 'skills' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select the skills your agent should have access to:
              </p>

              <div className="space-y-3">
                {AVAILABLE_SKILLS.map((skill) => (
                  <Card
                    key={skill.type}
                    className={cn(
                      'cursor-pointer transition-all hover:border-primary/50',
                      selectedSkills.includes(skill.type) &&
                        'border-primary ring-2 ring-primary/20'
                    )}
                    onClick={() => toggleSkill(skill.type)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              skill.type === 'slack' && 'bg-[#4A154B]/10',
                              skill.type === 'jira' && 'bg-[#0052CC]/10',
                              skill.type === 'confluence' && 'bg-[#172B4D]/10'
                            )}
                          >
                            <SkillIcon
                              type={skill.type}
                              className={cn(
                                'h-5 w-5',
                                skill.type === 'slack' && 'text-[#4A154B]',
                                skill.type === 'jira' && 'text-[#0052CC]',
                                skill.type === 'confluence' && 'text-[#172B4D]'
                              )}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {skill.description}
                            </p>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                            selectedSkills.includes(skill.type)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {selectedSkills.includes(skill.type) && (
                            <Check className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Skill config (shown when selected) */}
                      {selectedSkills.includes(skill.type) && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {skill.type === 'slack' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Slack Workspace</Label>
                              <Input
                                placeholder="workspace-name.slack.com"
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  setSkillConfigs((prev) => ({
                                    ...prev,
                                    slack: { ...prev.slack, workspace: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          )}
                          {skill.type === 'jira' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Jira Instance URL</Label>
                              <Input
                                placeholder="your-org.atlassian.net"
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  setSkillConfigs((prev) => ({
                                    ...prev,
                                    jira: { ...prev.jira, instanceUrl: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          )}
                          {skill.type === 'confluence' && (
                            <div className="space-y-2">
                              <Label className="text-xs">Confluence URL</Label>
                              <Input
                                placeholder="your-org.atlassian.net/wiki"
                                className="h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) =>
                                  setSkillConfigs((prev) => ({
                                    ...prev,
                                    confluence: { ...prev.confluence, url: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            MCP Server Connection
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedSkills.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">Select at least one skill to continue</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs">AGENT NAME</Label>
                  <p className="font-medium">{name}</p>
                </div>

                {description && (
                  <div>
                    <Label className="text-muted-foreground text-xs">DESCRIPTION</Label>
                    <p className="text-sm">{description}</p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground text-xs">INSTRUCTIONS</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
                    {instructions}
                  </p>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">CONTEXT SOURCE</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {contextType === 'documents' ? (
                      <>
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{documents.length} document(s) uploaded</span>
                      </>
                    ) : (
                      <>
                        <Plug className="h-4 w-4 text-purple-500" />
                        <span>{selectedSkills.length} skill(s) connected</span>
                      </>
                    )}
                  </div>
                </div>

                {contextType === 'documents' && documents.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs">DOCUMENTS</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {documents.map((doc) => (
                        <Badge key={doc.id} variant="secondary">
                          {doc.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {contextType === 'skills' && selectedSkills.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs">SKILLS</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSkills.map((type) => {
                        const skill = AVAILABLE_SKILLS.find((i) => i.type === type);
                        return (
                          <Badge key={type} variant="secondary" className="gap-1">
                            <SkillIcon type={type} className="h-3 w-3" />
                            {skill?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={step === 'basics' ? handleClose : handleBack}>
            {step === 'basics' ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </>
            )}
          </Button>

          {step === 'review' ? (
            <Button onClick={handleComplete}>
              <Bot className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
