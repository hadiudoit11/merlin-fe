"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/providers/apiRequest";
import { Loader2, CreditCard, Receipt, AlertCircle, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Types
interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isCurrent?: boolean;
}

interface BillingInfo {
  plan: BillingPlan | null;
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing' | null;
  current_period_end: string | null;
  payment_method: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  } | null;
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    date: string;
    pdf_url: string;
  }>;
}

const PLANS: BillingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Up to 3 canvases',
      '1 user',
      'Basic node types',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited canvases',
      'Up to 10 users',
      'All node types',
      'AI-powered features',
      'Priority support',
      'API access',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited everything',
      'Unlimited users',
      'Custom skills',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
      'Custom contracts',
    ],
  },
];

export default function BillingPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchBillingInfo = async () => {
      if (status !== 'authenticated') return;

      setIsLoading(true);
      try {
        const response = await apiGet(`${backendURL}/api/v1/billing/info/`);
        if (response) {
          setBillingInfo(response);
        }
      } catch (error) {
        console.error('Error fetching billing info:', error);
        // Set default state if API doesn't exist yet
        setBillingInfo({
          plan: PLANS[0],
          subscription_status: 'active',
          current_period_end: null,
          payment_method: null,
          invoices: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingInfo();
  }, [status, backendURL]);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      const response = await apiPost(`${backendURL}/api/v1/billing/create-checkout/`, {
        plan_id: planId,
      });

      if (response?.checkout_url) {
        window.location.href = response.checkout_url;
      } else {
        toast({
          title: "Upgrade initiated",
          description: "Please complete the checkout process.",
        });
      }
    } catch (error) {
      console.error('Error initiating upgrade:', error);
      toast({
        title: "Error",
        description: "Failed to initiate upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await apiPost(`${backendURL}/api/v1/billing/portal/`, {});

      if (response?.portal_url) {
        window.open(response.portal_url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Unauthorized
          </CardTitle>
          <CardDescription>
            Please sign in to view billing information.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentPlan = billingInfo?.plan || PLANS[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your current subscription plan and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{currentPlan.name}</span>
                <Badge variant={billingInfo?.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {billingInfo?.subscription_status || 'Active'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                ${currentPlan.price}/{currentPlan.interval}
              </p>
              {billingInfo?.current_period_end && (
                <p className="text-sm text-muted-foreground mt-1">
                  Next billing date: {new Date(billingInfo.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={handleManageBilling}>
              Manage Subscription
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {billingInfo?.payment_method && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Your saved payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-muted rounded">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium capitalize">
                  {billingInfo.payment_method.brand} ending in {billingInfo.payment_method.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires {billingInfo.payment_method.exp_month}/{billingInfo.payment_method.exp_year}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan.id === plan.id;
            return (
              <Card key={plan.id} className={isCurrent ? 'border-primary' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrent && <Badge>Current</Badge>}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.interval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        plan.price > currentPlan.price ? 'Upgrade' : 'Switch'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      {billingInfo?.invoices && billingInfo.invoices.length > 0 && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                Your recent invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {billingInfo.invoices.map((invoice) => (
                  <div key={invoice.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">${(invoice.amount / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                      {invoice.pdf_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Receipt className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
