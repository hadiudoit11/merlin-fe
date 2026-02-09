"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-gray-500 mb-8">Last updated: February 8, 2026</p>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to Typequest. These Terms of Service ("Terms") govern your
              access to and use of the Typequest platform, website, and services
              (collectively, the "Service") operated by Typequest LLC, doing
              business as Typequest ("Company," "we," "us," or "our").
            </p>

            <p className="text-gray-600 mb-6">
              By accessing or using the Service, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 mb-4">
              By creating an account or using the Service, you represent that
              you are at least 18 years old and have the legal capacity to enter
              into these Terms. If you are using the Service on behalf of an
              organization, you represent that you have the authority to bind
              that organization to these Terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              2. Description of Service
            </h2>
            <p className="text-gray-600 mb-4">
              Typequest provides a product management platform featuring an
              infinite canvas for OKRs, metrics tracking, and cross-functional
              collaboration. The Service includes features such as:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Visual OKR tracking and management</li>
              <li>Real-time collaboration tools</li>
              <li>AI-powered insights and recommendations</li>
              <li>Integration with third-party services</li>
              <li>Document and note management</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              3. User Accounts
            </h2>
            <p className="text-gray-600 mb-4">
              To access certain features of the Service, you must create an
              account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly notify us of any unauthorized access</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              4. Acceptable Use
            </h2>
            <p className="text-gray-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload malicious code or attempt to compromise the Service</li>
              <li>
                Use the Service to transmit spam or unsolicited communications
              </li>
              <li>
                Attempt to gain unauthorized access to other users' accounts
              </li>
              <li>Reverse engineer or decompile any part of the Service</li>
              <li>
                Use the Service in any way that could damage or overburden our
                infrastructure
              </li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              5. Intellectual Property
            </h2>
            <p className="text-gray-600 mb-4">
              The Service and its original content, features, and functionality
              are owned by Typequest LLC and are protected by international
              copyright, trademark, and other intellectual property laws. You
              retain ownership of any content you submit to the Service, but
              grant us a license to use, store, and display such content as
              necessary to provide the Service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              6. Payment and Billing
            </h2>
            <p className="text-gray-600 mb-4">
              Certain features of the Service may require payment. By
              subscribing to a paid plan, you agree to pay all applicable fees.
              Fees are non-refundable except as required by law or as explicitly
              stated in these Terms. We reserve the right to change our pricing
              with 30 days' notice.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              7. Third-Party Integrations
            </h2>
            <p className="text-gray-600 mb-4">
              The Service may integrate with third-party applications and
              services (such as Zoom, Slack, Jira, and others). Your use of such
              integrations is subject to the terms and privacy policies of those
              third parties. We are not responsible for the practices of
              third-party services.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              8. Data and Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              Your privacy is important to us. Our collection and use of
              personal information is governed by our{" "}
              <Link href="/privacy" className="text-[#ff6b6b] hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              9. Disclaimer of Warranties
            </h2>
            <p className="text-gray-600 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT
              NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR
              A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
              THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              10. Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, TYPEQUEST LLC SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
              PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
              INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE,
              GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF
              THE SERVICE.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              11. Indemnification
            </h2>
            <p className="text-gray-600 mb-4">
              You agree to indemnify and hold harmless Typequest LLC and its
              officers, directors, employees, and agents from any claims,
              damages, losses, or expenses arising from your use of the Service
              or violation of these Terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              12. Termination
            </h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your account and access to the Service
              at our sole discretion, without prior notice, for conduct that we
              believe violates these Terms or is harmful to other users, us, or
              third parties, or for any other reason. Upon termination, your
              right to use the Service will immediately cease.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              13. Changes to Terms
            </h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these Terms at any time. We will
              notify you of any material changes by posting the new Terms on the
              Service and updating the "Last updated" date. Your continued use
              of the Service after such changes constitutes acceptance of the
              new Terms.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              14. Governing Law
            </h2>
            <p className="text-gray-600 mb-4">
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Delaware, without regard to its conflict
              of law provisions. Any disputes arising under these Terms shall be
              resolved in the state or federal courts located in Delaware.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900">
              15. Contact Information
            </h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-600 mb-4">
              Typequest LLC
              <br />
              Email: legal@typequest.io
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
