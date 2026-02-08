'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  DollarSign,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useFinancial';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/financial-utils';
import { Chart } from '@/components/ui/chart';

export function AnalyticsPanel() {
  const { analytics, loading, error, refresh } = useAnalytics();

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading analytics: {error}</p>
            <Button onClick={refresh} variant="outline" className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const monthlyImportsData = analytics ? Object.entries(analytics.monthly_imports).map(([month, count]) => ({
    name: month,
    imports: count,
  })) : [];

  const topInstitutionsData = analytics ? analytics.top_institutions.slice(0, 5).map((institution, index) => ({
    name: institution.name,
    count: institution.count,
    fill: `hsl(${index * 60}, 70%, 50%)`,
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Insights and trends from your financial data
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Imports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : analytics?.total_imports || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              All time statement imports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : analytics?.total_transactions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Processed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : formatPercentage(analytics?.import_success_rate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Import success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '...' : `${analytics?.average_processing_time || 0}m`}
            </div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Imports Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Monthly Imports
            </CardTitle>
            <CardDescription>
              Import activity over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : monthlyImportsData.length > 0 ? (
              <Chart
                type="bar"
                data={monthlyImportsData}
                index="name"
                categories={["imports"]}
                colors={["blue"]}
                yAxisWidth={48}
                className="h-[300px]"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Institutions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Top Institutions
            </CardTitle>
            <CardDescription>
              Most frequently imported institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : topInstitutionsData.length > 0 ? (
              <Chart
                type="pie"
                data={topInstitutionsData}
                index="name"
                category="count"
                className="h-[300px]"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Institutions List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Financial Institutions</CardTitle>
            <CardDescription>
              Most active institutions in your imports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : analytics?.top_institutions && analytics.top_institutions.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_institutions.slice(0, 10).map((institution, index) => (
                  <div key={institution.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{institution.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {institution.count} imports
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No institution data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                    <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Import Success Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(analytics?.import_success_rate || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analytics?.import_success_rate || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Review Efficiency</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(analytics?.review_efficiency || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analytics?.review_efficiency || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Processing Time</span>
                    <span className="text-sm text-muted-foreground">
                      {analytics?.average_processing_time || 0} minutes
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((analytics?.average_processing_time || 0) / 10 * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Transactions</span>
                    <span className="text-sm text-muted-foreground">
                      {analytics?.total_transactions || 0} processed
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((analytics?.total_transactions || 0) / 1000 * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">Strong Performance</h4>
                </div>
                <p className="text-sm text-green-700">
                  Your import success rate of {formatPercentage(analytics?.import_success_rate || 0)} is excellent. 
                  Keep up the good work with statement quality.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-800">Efficiency Gains</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Average processing time of {analytics?.average_processing_time || 0} minutes shows 
                  good system performance.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-purple-800">Regular Imports</h4>
                </div>
                <p className="text-sm text-purple-700">
                  {analytics?.total_imports || 0} total imports show consistent financial tracking. 
                  Consider setting up automated reminders.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 