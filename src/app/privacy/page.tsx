"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/user/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "Fraunces, Georgia, serif", color: "#2d2d2d" }}
          >
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-8">Last updated: February 8, 2026</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Typequest LLC, doing business as Typequest ("Company," "we," "us,"
              or "our"), is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our platform and services (the
              "Service").
            </p>

            <p className="text-gray-600 mb-6">
              Please read this Privacy Policy carefully. By using the Service,
              you consent to the practices described in this policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              1. Information We Collect
            </h2>

            <h3 className="text-lg font-medium mt-6 mb-3 text-gray-800">
              1.1 Information You Provide
            </h3>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>
                <strong>Account Information:</strong> Name, email address,
                password, and profile information
              </li>
              <li>
                <strong>Organization Information:</strong> Company name, team
                details, and billing information
              </li>
              <li>
                <strong>Content:</strong> OKRs, documents, notes, comments, and
                other content you create within the Service
              </li>
              <li>
                <strong>Communications:</strong> Information you provide when
                contacting us for support
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-3 text-gray-800">
              1.2 Information Collected Automatically
            </h3>
            <p className="text-gray-600 mb-4">
              When you use the Service, we automatically collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, and
                actions taken within the Service
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, device identifiers, and IP address
              </li>
              <li>
                <strong>Log Data:</strong> Access times, error logs, and
                referring URLs
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies and similar tracking
                technologies to enhance your experience
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-6 mb-3 text-gray-800">
              1.3 Information from Third Parties
            </h3>
            <p className="text-gray-600 mb-4">
              When you connect third-party services (such as Zoom, Slack, Jira,
              or Google), we may receive:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Profile information from OAuth providers</li>
              <li>Meeting recordings and transcripts (with your permission)</li>
              <li>Messages and content from integrated services</li>
              <li>Task and project data from productivity tools</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and security alerts</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>
                Analyze usage patterns to improve user experience and develop
                new features
              </li>
              <li>
                Generate AI-powered insights and recommendations based on your
                content
              </li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              3. AI and Machine Learning
            </h2>
            <p className="text-gray-600 mb-4">
              Our Service uses artificial intelligence and machine learning to
              provide features such as:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Meeting transcript summarization and action item extraction</li>
              <li>Content recommendations and insights</li>
              <li>Semantic search across your workspace</li>
              <li>Automated document generation assistance</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Your content may be processed by AI systems to provide these
              features. We do not use your content to train our AI models
              without your explicit consent.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              4. Information Sharing
            </h2>
            <p className="text-gray-600 mb-4">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>
                <strong>With Your Consent:</strong> When you explicitly agree to
                share information
              </li>
              <li>
                <strong>Within Your Organization:</strong> With other members of
                your workspace as configured by your organization
              </li>
              <li>
                <strong>Service Providers:</strong> With vendors who assist in
                operating the Service (hosting, analytics, payment processing)
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to
                protect our rights and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              5. Data Retention
            </h2>
            <p className="text-gray-600 mb-4">
              We retain your information for as long as your account is active
              or as needed to provide the Service. We may retain certain
              information as required by law or for legitimate business
              purposes. When you delete your account, we will delete or
              anonymize your personal information within 90 days, unless
              retention is required by law.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              6. Data Security
            </h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to
              protect your information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-600 mb-4">
              However, no method of transmission over the Internet is 100%
              secure. We cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              7. Your Rights and Choices
            </h2>
            <p className="text-gray-600 mb-4">
              Depending on your location, you may have certain rights regarding
              your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>
                <strong>Access:</strong> Request a copy of your personal
                information
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Portability:</strong> Request a portable copy of your
                data
              </li>
              <li>
                <strong>Opt-Out:</strong> Opt out of marketing communications
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent where
                processing is based on consent
              </li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise these rights, contact us at privacy@typequest.io.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              8. Cookies and Tracking
            </h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Keep you logged in to the Service</li>
              <li>Remember your preferences</li>
              <li>Analyze usage and improve performance</li>
              <li>Provide personalized features</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You can control cookies through your browser settings. Disabling
              cookies may affect the functionality of the Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              9. International Data Transfers
            </h2>
            <p className="text-gray-600 mb-4">
              Your information may be transferred to and processed in countries
              other than your own. We ensure appropriate safeguards are in place
              to protect your information in accordance with applicable data
              protection laws.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              10. Children's Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              The Service is not intended for users under 18 years of age. We do
              not knowingly collect personal information from children. If we
              learn we have collected information from a child, we will delete
              it promptly.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              11. California Privacy Rights
            </h2>
            <p className="text-gray-600 mb-4">
              California residents have additional rights under the California
              Consumer Privacy Act (CCPA), including the right to know what
              personal information we collect, the right to delete personal
              information, and the right to opt out of the sale of personal
              information. We do not sell personal information.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              12. Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new policy on
              the Service and updating the "Last updated" date. Your continued
              use of the Service after changes constitutes acceptance of the
              updated policy.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              13. Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data
              practices, please contact us at:
            </p>
            <p className="text-gray-600 mb-4">
              Typequest LLC
              <br />
              Email: privacy@typequest.io
            </p>
            <p className="text-gray-600 mb-4">
              For data protection inquiries in the European Union, you may also
              contact your local data protection authority.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          &copy; {new Date().getFullYear()} Typequest LLC. All rights reserved.
        </p>
      </div>
    </div>
  );
}
