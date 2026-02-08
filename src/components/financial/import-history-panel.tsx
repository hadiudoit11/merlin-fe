'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useImports } from '@/hooks/useFinancial';
import { formatDate, formatFileSize, getStatusBadgeVariant, getTimeAgo } from '@/lib/financial-utils';
import { ImportSummary } from '@/types/financial';
import { toast } from 'sonner';

export function ImportHistoryPanel() {
  const { imports, loading, error, refresh } = useImports();
  const [reprocessing, setReprocessing] = useState<string | null>(null);

  const handleReprocess = async (importId: string) => {
    setReprocessing(importId);
    try {
      // This would call the reprocess API endpoint
      // await reprocessImport(importId);
      toast.success('Import reprocessing started');
      refresh();
    } catch (error) {
      toast.error('Failed to reprocess import');
    } finally {
      setReprocessing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'partially_completed':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'partially_completed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading imports: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Import History</h2>
          <p className="text-muted-foreground">
            View all your statement imports and their processing status
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : imports.length}
            </div>
            <p className="text-xs text-muted-foreground">
              All time imports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : imports.filter(i => i.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed successfully
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : imports.filter(i => i.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Processing failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? '...' : imports.length > 0 
                ? `${Math.round((imports.filter(i => i.status === 'completed').length / imports.length) * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Overall success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Imports List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Imports</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${imports.length} imports found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading imports...</p>
            </div>
          ) : imports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No imports found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your first statement to get started
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {imports.map((importItem) => {
                  const statusBadge = getStatusBadgeVariant(importItem.status);
                  
                  return (
                    <div key={importItem.import_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(importItem.status)}
                            <div>
                              <h3 className="font-medium">{importItem.filename}</h3>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                                <span>Import ID: {importItem.import_id}</span>
                                <span>•</span>
                                <span>{getTimeAgo(importItem.created_at)}</span>
                                {importItem.institution && (
                                  <>
                                    <span>•</span>
                                    <span>{importItem.institution}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Imported:</span>
                              <span className="ml-2 font-medium text-green-600">
                                {importItem.transactions_imported}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Skipped:</span>
                              <span className="ml-2 font-medium text-yellow-600">
                                {importItem.transactions_skipped}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pending:</span>
                              <span className="ml-2 font-medium text-blue-600">
                                {importItem.pending_review}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Approved:</span>
                              <span className="ml-2 font-medium text-green-600">
                                {importItem.approved}
                              </span>
                            </div>
                          </div>

                          {importItem.statement_period.start && importItem.statement_period.end && (
                            <div className="text-sm text-muted-foreground">
                              <span>Period: </span>
                              <span>{formatDate(importItem.statement_period.start)} - {formatDate(importItem.statement_period.end)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={statusBadge.variant} className={statusBadge.className}>
                            {importItem.status}
                          </Badge>
                          
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            
                            {(importItem.status === 'failed' || importItem.status === 'partially_completed') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReprocess(importItem.import_id)}
                                disabled={reprocessing === importItem.import_id}
                              >
                                {reprocessing === importItem.import_id ? (
                                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                )}
                                Reprocess
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 