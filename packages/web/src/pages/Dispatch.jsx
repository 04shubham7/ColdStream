import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Cog, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { useTemplates } from "../hooks/useTemplates";
import { useResumes } from "../hooks/useResumes";
import { useDispatchEmail, useUserJobs, useDispatchJob } from "../hooks/useDispatch";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

function DispatchForm({ onSuccess }) {
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [variables, setVariables] = useState({ company: "", role: "" });
  const [error, setError] = useState("");

  const { data: templates } = useTemplates();
  const { data: resumes } = useResumes();
  const dispatchEmail = useDispatchEmail();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await dispatchEmail.mutateAsync({
        recruiterEmail,
        templateId,
        resumeId,
        variables,
      });
      onSuccess();
      setRecruiterEmail("");
      setTemplateId("");
      setResumeId("");
      setVariables({ company: "", role: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Dispatch failed");
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Send Cold Email</CardTitle>
        <CardDescription>
          Queue an email for async dispatch via Kafka
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Recruiter Email</Label>
            <Input
              id="email"
              type="email"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
              placeholder="hr@company.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-input/50 bg-white px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary hover:border-primary/30"
                required
              >
                <option value="">Select template</option>
                {templates?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume</Label>
              <select
                id="resume"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-input/50 bg-white px-4 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary hover:border-primary/30"
                required
              >
                <option value="">Select resume</option>
                {resumes?.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={variables.company}
                onChange={(e) =>
                  setVariables({ ...variables, company: e.target.value })
                }
                placeholder="Amazon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={variables.role}
                onChange={(e) =>
                  setVariables({ ...variables, role: e.target.value })
                }
                placeholder="SDE Intern"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={dispatchEmail.isPending}
          >
            {dispatchEmail.isPending ? "Queuing..." : "Dispatch Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function JobStatusCard({ jobId }) {
  const { data: job } = useDispatchJob(jobId);

  if (!job) return null;

  return (
    <Card className="glass-card mt-4">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Job: {job.jobId}</p>
            <p className="text-xs text-muted-foreground">
              To: {job.recruiterEmail}
            </p>
          </div>
            <span
            className={`px-3 py-1 text-sm rounded-full font-semibold shadow-sm border ${
              job.status === "sent"
                ? "bg-green-100 text-green-700 border-green-200"
                : job.status === "failed" || job.status === "dlq"
                ? "bg-red-100 text-red-700 border-red-200"
                : job.status === "processing"
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : "bg-yellow-100 text-yellow-700 border-yellow-200"
            }`}
          >
            {job.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function getErrorType(errorStr) {
  if (!errorStr) return "Unknown Error";
  const str = errorStr.toLowerCase();
  if (str.includes("mongo") || str.includes("topology")) return "Database Error (MongoDB)";
  if (str.includes("redis") || str.includes("ioredis")) return "Cache Error (Redis)";
  if (str.includes("kafka") || str.includes("broker")) return "Queue Error (Kafka)";
  if (str.includes("econnrefused") && str.includes("smtp")) return "SMTP Connection Error";
  if (str.includes("template") || str.includes("resume")) return "Resource Resolution Error";
  return `Backend Error: ${errorStr.substring(0, 40)}...`;
}

function InlineJobTracker({ job }) {
  const steps = [
    { id: "queued", label: "Queued", icon: Package },
    { id: "processing", label: "Processing", icon: Cog },
    { 
      id: job.status === "failed" || job.status === "dlq" ? "failed" : "sent", 
      label: job.status === "failed" || job.status === "dlq" ? "Failed" : "Sent", 
      icon: job.status === "failed" || job.status === "dlq" ? AlertCircle : CheckCircle2 
    }
  ];

  const currentStepIndex = 
    job.status === "queued" ? 0 : 
    job.status === "processing" ? 1 : 
    2;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-white/20 bg-gray-50/50 rounded-b-xl"
    >
      <div className="p-6 overflow-x-auto">
        <div className="relative flex justify-between min-w-[300px]">
          <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200" />
          <div 
            className="absolute top-5 left-12 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%`, maxWidth: "calc(100% - 3rem)" }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFailed = step.id === "failed";
            
            let colorClass = "bg-gray-100 text-gray-400 border-gray-200";
            if (isCompleted) colorClass = "bg-primary text-primary-foreground border-primary";
            else if (isCurrent) {
              if (isFailed) colorClass = "bg-red-500 text-white border-red-500 ring-4 ring-red-500/20";
              else if (step.id === "sent") colorClass = "bg-green-500 text-white border-green-500 ring-4 ring-green-500/20";
              else colorClass = "bg-blue-500 text-white border-blue-500 ring-4 ring-blue-500/20 animate-pulse";
            }

            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-transparent z-10 w-24">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-300 ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-medium ${isCurrent || isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </span>
                {isFailed && isCurrent && (
                  <span className="text-[10px] text-red-600 w-32 text-center leading-tight font-medium mt-1 bg-red-50 px-2 py-1 rounded">
                    {getErrorType(job.lastError)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function JobHistory() {
  const [page, setPage] = useState(1);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const { data, isLoading } = useUserJobs(page);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Job History</CardTitle>
        <CardDescription>
          Recent email dispatch jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : data?.jobs?.length > 0 ? (
          <>
            <div className="space-y-3">
              {data.jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="flex flex-col rounded-xl border border-white/40 bg-white/40 shadow-sm transition-all overflow-hidden"
                >
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/60 transition-colors cursor-pointer gap-4 sm:gap-0"
                    onClick={() => setExpandedJobId(expandedJobId === job.jobId ? null : job.jobId)}
                  >
                    <div>
                      <p className="text-sm font-medium break-all sm:break-normal">{job.recruiterEmail}</p>
                      <p className="text-xs text-muted-foreground mt-1 sm:mt-0">
                        {job.templateId?.name || "Template"} •{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold border ${
                          job.status === "sent"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : job.status === "failed" || job.status === "dlq"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : job.status === "processing"
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : "bg-yellow-100 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {job.status}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 pl-2 pr-3">
                        Track <ChevronDown className={`w-4 h-4 transition-transform ${expandedJobId === job.jobId ? "rotate-180" : ""}`} />
                      </Button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedJobId === job.jobId && <InlineJobTracker job={job} />}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            {data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  Page {page} of {data.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No jobs yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dispatch() {
  const [lastJobId, setLastJobId] = useState(null);

  const handleSuccess = (jobId) => {
    setLastJobId(jobId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispatch</h1>
        <p className="text-muted-foreground mt-1">
          Send cold emails to recruiters
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <DispatchForm onSuccess={handleSuccess} />
          {lastJobId && <JobStatusCard jobId={lastJobId} />}
        </div>
        <JobHistory />
      </div>
    </div>
  );
}
