import { useState, useEffect } from "react";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "../hooks/useTemplates";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Textarea } from "../components/ui/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";

function TemplateModal({ isOpen, onClose, template, onSave }) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");

  useEffect(() => {
    if (isOpen) {
      setName(template?.name || "");
      setSubject(template?.subject || "");
      setBody(template?.body || "");
    }
  }, [isOpen, template]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, subject, body });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {template ? "Edit Template" : "Create Template"}
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Amazon SDE Intern"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Application for {{role}} at {{company}}"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Use {{variable}} for dynamic content..."
                rows={8}
                required
              />
            </div>
          </div>
          <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-xl">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const DEMO_TEMPLATE = {
  _id: "demo",
  name: "Software Engineer Application (Example)",
  subject: "Application for {{role}} at {{company}}",
  body: "Hi Hiring Team at {{company}},\n\nI am writing to express my strong interest in the {{role}} position. My background in building scalable web applications aligns well with the goals of {{company}}.\n\nPlease find my resume attached. I look forward to discussing how I can contribute to your team.\n\nBest regards,\n[Your Name]",
  isDemo: true,
};

export default function Templates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate._id, ...data });
    } else {
      await createTemplate.mutateAsync(data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      await deleteTemplate.mutateAsync(id);
    }
  };

  const displayTemplates = templates ? [DEMO_TEMPLATE, ...templates] : [DEMO_TEMPLATE];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage your cold email templates
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">Create Template</Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayTemplates.map((template) => (
            <Card key={template._id} className={`glass-card flex flex-col group ${template.isDemo ? 'border-primary/20 bg-primary/5' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.isDemo && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Example
                    </span>
                  )}
                </div>
                <CardDescription className="line-clamp-1">
                  {template.subject}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 mb-4">
                  {template.body}
                </p>
                {!template.isDemo && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={editingTemplate}
        onSave={handleSave}
      />
    </div>
  );
}
