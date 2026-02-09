'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useReviewStatistics } from '@/hooks/useFinancial';
import { useAnalytics } from '@/hooks/useFinancial';
import { formatCurrency, formatPercentage, getTimeAgo } from '@/lib/financial-utils';
import { TransactionReviewPanel } from '@/components/financial/transaction-review-panel';
import { ImportHistoryPanel } from '@/components/financial/import-history-panel';
import { AnalyticsPanel } from '@/components/financial/analytics-panel';
import { FileUploadPanel } from '@/components/financial/file-upload-panel';

function FinancialDashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { statistics, loading: statsLoading, refresh: refreshStats } = useReviewStatistics();
  const { analytics, loading: analyticsLoading, refresh: refreshAnalytics } = useAnalytics();

  // Initialize tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'review', 'imports', 'analytics', 'upload'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleRefresh = () => {
    refreshStats();
    refreshAnalytics();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your financial statements and review transactions
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : statistics?.total_pending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Transactions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? '...' : statistics?.total_approved || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? '...' : statistics?.total_posted || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Posted to ledger
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {statsLoading ? '...' : formatPercentage(statistics?.review_efficiency || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average review time: {statsLoading ? '...' : `${statistics?.average_review_time || 0}m`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest transactions and imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {analyticsLoading ? (
                      <div className="text-center py-8">
                        <Activity className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-2">Loading activity...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">Statement Import</p>
                              <p className="text-xs text-muted-foreground">
                                {analytics?.total_imports || 0} total imports
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium">Review Process</p>
                              <p className="text-xs text-muted-foreground">
                                {formatPercentage(statistics?.review_efficiency || 0)} efficiency
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-600">
                            {statistics?.total_approved || 0} approved
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium">Total Transactions</p>
                              <p className="text-xs text-muted-foreground">
                                {analytics?.total_transactions || 0} processed
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-purple-600">
                            {formatPercentage(analytics?.import_success_rate || 0)} success
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('upload')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Statement
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('review')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Pending Transactions
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('imports')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Import History
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('analytics')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <TransactionReviewPanel />
        </TabsContent>

        <TabsContent value="imports" className="space-y-4">
          <ImportHistoryPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsPanel />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <FileUploadPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FinancialDashboard() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6">
        <Activity className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <FinancialDashboardContent />
    </Suspense>
  );
} 