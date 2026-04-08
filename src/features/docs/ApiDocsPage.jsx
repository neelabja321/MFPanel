import ReactMarkdown from 'react-markdown'
import apiDocs from '../../../required_apis.md?raw'
import PageHeader from '@/components/shared/PageHeader'

export default function ApiDocsPage() {
  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-10">
      <PageHeader 
        title="API Documentation" 
        description="Comprehensive endpoint specification for backing the Microfinance platform" 
      />

      <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 shadow-sm overflow-x-auto">
        <div className="prose prose-slate prose-sm sm:prose-base dark:prose-invert max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-headings:font-bold prose-a:text-primary">
          <ReactMarkdown>
            {apiDocs}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
