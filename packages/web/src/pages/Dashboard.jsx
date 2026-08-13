import { useAuthStore } from "../store/authStore";
import { useTemplates } from "../hooks/useTemplates";
import { useResumes } from "../hooks/useResumes";
import { useUserJobs } from "../hooks/useDispatch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { data: templates } = useTemplates();
  const { data: resumes } = useResumes();
  const { data: jobsData } = useUserJobs();

  const stats = [
    {
      name: "Templates",
      value: templates?.length || 0,
      description: "Email templates created",
    },
    {
      name: "Resumes",
      value: resumes?.length || 0,
      description: "Resumes uploaded",
    },
    {
      name: "Emails Sent",
      value: jobsData?.jobs?.filter((j) => j.status === "sent").length || 0,
      description: "Total emails dispatched",
    },
    {
      name: "Pending",
      value: jobsData?.jobs?.filter((j) => j.status === "queued" || j.status === "processing").length || 0,
      description: "In queue or processing",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your cold email outreach
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <CardDescription className="text-xs text-muted-foreground">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest email dispatches</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsData?.jobs?.length > 0 ? (
              <div className="space-y-3">
                {jobsData.jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.jobId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="text-sm font-medium">{job.recruiterEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.templateId?.name || "Template"}
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
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No emails dispatched yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/templates"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <p className="text-sm font-medium">Create Template</p>
              <p className="text-xs text-muted-foreground">
                Design a new cold email template
              </p>
            </a>
            <a
              href="/resumes"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <p className="text-sm font-medium">Upload Resume</p>
              <p className="text-xs text-muted-foreground">
                Add a PDF resume to your account
              </p>
            </a>
            <a
              href="/dispatch"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <p className="text-sm font-medium">Send Email</p>
              <p className="text-xs text-muted-foreground">
                Dispatch a cold email to a recruiter
              </p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
