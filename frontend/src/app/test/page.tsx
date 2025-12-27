'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestPage() {
  const [frontendTest, setFrontendTest] = useState<any>(null);
  const [backendTest, setBackendTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    setLoading(true);

    // Test frontend connection
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      setFrontendTest({
        success: !error,
        error: error?.message || null,
        count: count || 0,
        message: error ? 'Frontend connection failed' : 'Frontend connection successful!'
      });
    } catch (error: any) {
      setFrontendTest({
        success: false,
        error: error.message,
        message: 'Frontend connection failed'
      });
    }

    // Test backend connection
    try {
      const response = await fetch('http://localhost:4000/test/db');
      const data = await response.json();
      setBackendTest(data);
    } catch (error: any) {
      setBackendTest({
        success: false,
        error: error.message,
        message: 'Backend connection failed'
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Connection Test</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Testing connections...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Frontend Test */}
            <div className={`bg-white rounded-lg shadow p-6 ${frontendTest?.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
              <h2 className="text-xl font-semibold mb-4">Frontend Connection (Supabase Client)</h2>
              {frontendTest?.success ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ {frontendTest.message}</p>
                  <p className="text-sm text-gray-600">Profiles table accessible: {frontendTest.count} records</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-600 font-medium">✗ {frontendTest?.message}</p>
                  {frontendTest?.error && (
                    <p className="text-sm text-red-500">Error: {frontendTest.error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Backend Test */}
            <div className={`bg-white rounded-lg shadow p-6 ${backendTest?.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
              <h2 className="text-xl font-semibold mb-4">Backend Connection (API + Supabase)</h2>
              {backendTest?.success ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ {backendTest.message}</p>
                  <p className="text-sm text-gray-600">Profiles table accessible: {backendTest.tables?.profiles?.count || 0} records</p>
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-xs font-mono text-gray-600">
                      Config: {JSON.stringify(backendTest.config, null, 2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-600 font-medium">✗ {backendTest?.message || 'Backend connection failed'}</p>
                  {backendTest?.error && (
                    <p className="text-sm text-red-500">Error: {backendTest.error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Test All Tables */}
            {backendTest?.success && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">All Tables Test</h2>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:4000/test/tables');
                      const data = await response.json();
                      setBackendTest(data);
                    } catch (error: any) {
                      console.error('Error testing tables:', error);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Test All Tables
                </button>
                {backendTest?.tables && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(backendTest.tables).map(([table, info]: [string, any]) => (
                      <div key={table} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="font-mono text-sm">{table}</span>
                        <span className={`text-sm ${info.accessible ? 'text-green-600' : 'text-red-600'}`}>
                          {info.accessible ? `✓ ${info.count} records` : `✗ ${info.error}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Retry Button */}
            <div className="text-center">
              <button
                onClick={testConnections}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Retry Tests
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

