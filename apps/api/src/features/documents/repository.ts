import {
  type Document,
  type DocumentSummary,
  type SystemTemplate,
  type Template,
  type TemplateInput,
} from "@complyflow/shared"

export interface DocumentRepository {
  listTemplates(): Promise<Template[]>
  createTemplateFromSystem(systemTemplate: SystemTemplate): Promise<Template>
  updateTemplate(id: string, input: TemplateInput): Promise<Template | null>
  deleteTemplate(id: string): Promise<boolean>
  listDocumentSummaries(
    sourceHashForTemplate: (template: Template) => string,
  ): Promise<DocumentSummary[]>
  createDocument(input: {
    template: Template
    title: string
    renderedContent: string
    sourceHash: string
  }): Promise<Document>
  getDocument(id: string): Promise<Document | null>
}
