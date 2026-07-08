'use client';

/**
 * Swagger UI Component
 * Interactive API documentation using swagger-ui-react
 */

export default function SwaggerUI() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">API Documentation</h2>
      <p className="text-gray-600">
        Interactive API documentation will be available here once swagger-ui-react is installed.
      </p>
      <div className="mt-4">
        <a
          href="/openapi.yaml"
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          View OpenAPI Specification
        </a>
      </div>
    </div>
  );
}
