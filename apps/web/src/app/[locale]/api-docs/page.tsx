/**
 * API Documentation Page
 * Swagger UI for OpenAPI specification
 */

import type { Metadata } from 'next';
// import SwaggerUI from '@/components/docs/SwaggerUI';

export const metadata: Metadata = {
  title: 'API Documentation | PranaKaia',
  description: 'REST API documentation for PranaKaia E-Commerce platform',
  robots: {
    index: false, // Don't index API docs
  },
};

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">API Documentation</h1>
          <p className="mt-2 text-muted-foreground">
            Complete REST API reference for PranaKaia E-Commerce platform
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">API Documentation</h3>
            <p className="text-muted-foreground mb-4">
              OpenAPI specification is available at{' '}
              <a
                href="/openapi.yaml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                /openapi.yaml
              </a>
            </p>
            <p className="text-sm text-muted-foreground">
              Interactive documentation will be available after deployment.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold">Getting Started</h2>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                The PranaKaia API is organized around REST. Our API has predictable
                resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded
                responses, and uses standard HTTP response codes, authentication, and verbs.
              </p>

              <h3 className="text-lg font-medium text-foreground">Authentication</h3>
              <p>
                Most API endpoints require authentication using Supabase JWT tokens. Include the
                token in the Authorization header:
              </p>
              <pre className="rounded bg-muted p-4 text-sm">
                Authorization: Bearer &lt;your_token_here&gt;
              </pre>

              <h3 className="text-lg font-medium text-foreground">Rate Limits</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Public endpoints: 100 requests/minute</li>
                <li>Auth endpoints: 5 requests/15 minutes</li>
                <li>Checkout endpoints: 10 requests/minute</li>
                <li>Webhooks: 1000 requests/minute</li>
              </ul>

              <h3 className="text-lg font-medium text-foreground">Errors</h3>
              <p>
                PranaKaia uses conventional HTTP response codes to indicate the success or failure
                of an API request. Codes in the 2xx range indicate success. Codes in the 4xx range
                indicate an error that failed given the information provided. Codes in the 5xx range
                indicate an error with our servers.
              </p>

              <h3 className="text-lg font-medium text-foreground">Support</h3>
              <p>
                For API support, contact us at{' '}
                <a href="mailto:api@pranakaia.com" className="text-primary hover:underline">
                  api@pranakaia.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
