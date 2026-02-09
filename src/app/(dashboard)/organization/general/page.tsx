"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiGet, apiPut } from "@/providers/apiRequest";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface OrganizationSettings {
  id: number;
  name: string;
  website: string;
  description: string;
  contact_email: string;
  phone: string;
  address: string;
}

export default function GeneralSettingsPage() {
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationWebsite, setOrganizationWebsite] = useState("");
  const [organizationDescription, setOrganizationDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Fetch organization settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (status !== 'authenticated') return;

      setIsLoading(true);
      try {
        const response = await apiGet(`${backendURL}/api/v1/organizations/current/`);
        if (response) {
          setOrganizationId(response.id);
          setOrganizationName(response.name || "");
          setOrganizationWebsite(response.website || "");
          setOrganizationDescription(response.description || "");
          setContactEmail(response.contact_email || "");
          setPhone(response.phone || "");
          setAddress(response.address || "");
        }
      } catch (error) {
        console.error('Error fetching organization settings:', error);
        toast({
          title: "Error",
          description: "Failed to load organization settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [status, backendURL, toast]);

  const handleSave = async () => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Organization not found.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiPut(`${backendURL}/api/v1/organizations/${organizationId}/`, {
        name: organizationName,
        website: organizationWebsite,
        description: organizationDescription,
        contact_email: contactEmail,
        phone: phone,
        address: address,
      });

      toast({
        title: "Settings saved",
        description: "Your organization settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
            Please sign in to view organization settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={organizationWebsite}
              onChange={(e) => setOrganizationWebsite(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={organizationDescription}
              onChange={(e) => setOrganizationDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            How people can reach your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="123 Main St, Anytown, ST 12345"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
