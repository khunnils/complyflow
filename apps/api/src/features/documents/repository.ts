import {
  type Document,
  type DocumentSummary,
  type SystemTemplate,
  type Template,
  type TemplateInput,
} from "@complyflow/shared"

export interface DocumentRepository {
  listTemplates(organizationId: string): Promise<Template[]>
  createTemplateFromSystem(
    organizationId: string,
    systemTemplate: SystemTemplate,
  ): Promise<Template>
  updateTemplate(
    organizationId: string,
    id: string,
    input: TemplateInput,
  ): Promise<Template | null>
  deleteTemplate(organizationId: string, id: string): Promise<boolean>
  listDocumentSummaries(
    organizationId: string,
    sourceHashForTemplate: (template: Template) => string,
  ): Promise<DocumentSummary[]>
  createDocument(input: {
    template: Template
    title: string
    renderedContent: string
    sourceHash: string
  }): Promise<Document>
  getDocument(organizationId: string, id: string): Promise<Document | null>
}
