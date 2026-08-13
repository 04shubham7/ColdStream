import { useState } from "react";
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
    <Card>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <select
                id="template"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

          <div className="grid grid-cols-2 gap-4">
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
    <Card className="mt-4">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Job: {job.jobId}</p>
            <p className="text-xs text-muted-foreground">
              To: {job.recruiterEmail}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              job.status === "sent"
                ? "bg-green-100 text-green-700"
                : job.status === "failed" || job.status === "dlq"
                ? "bg-red-100 text-red-700"
                : job.status === "processing"
                ? "bg-blue-100 text-blue-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {job.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function JobHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserJobs(page);

  return (
    <Card>
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
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">{job.recruiterEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.templateId?.name || "Template"} •{" "}
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      job.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : job.status === "failed" || job.status === "dlq"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status}
                  </span>
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
