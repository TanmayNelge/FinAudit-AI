import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

export function AuditResults() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents on component mount
  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Poll every 5 seconds to catch files that finish processing
    const interval = setInterval(fetchDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-slate-400 p-6">Loading audit history...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-4">
      <h2 className="text-xl font-bold text-slate-100 mb-4 border-b border-slate-800 pb-2">
        Recent Audits
      </h2>
      
      {documents.length === 0 ? (
        <p className="text-slate-500 text-sm">No documents processed yet.</p>
      ) : (
        documents.map((doc) => (
          <div key={doc._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="text-blue-400 size-5" />
                </div>
                <div>
                  <h3 className="text-slate-200 font-medium">{doc.fileName}</h3>
                  <p className="text-slate-500 text-xs">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Dynamic Score Badge */}
              {doc.status === 'completed' && (
                <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                  doc.complianceScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  doc.complianceScore >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {doc.complianceScore >= 80 ? <CheckCircle className="size-4"/> : <ShieldAlert className="size-4"/>}
                  Score: {doc.complianceScore}/100
                </div>
              )}
            </div>

            {/* AI Flagged Issues */}
            {doc.status === 'completed' && doc.flaggedIssues?.length > 0 && (
              <div className="mt-4 space-y-2 bg-slate-950 rounded-lg p-4 border border-slate-800/50">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Flagged Risks</h4>
                {doc.flaggedIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className={`size-4 shrink-0 mt-0.5 ${
                      issue.severity === 'High' ? 'text-rose-400' : 
                      issue.severity === 'Medium' ? 'text-amber-400' : 'text-blue-400'
                    }`} />
                    <div>
                      <span className="font-medium text-slate-300">{issue.clause}: </span>
                      <span className="text-slate-500">{issue.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {doc.status === 'processing' && (
              <div className="text-blue-400 text-sm animate-pulse">AI is currently auditing this document...</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}