import {
  type Document,
  type DocumentSummary,
  type SystemTemplate,
  type Template,
  type TemplateInput,
} from "@complyflow/shared"

import { ApiError } from "../../errors.js"
import { type OrganizationRepository } from "../organizations/repository.js"
import { type DocumentRepository } from "./repository.js"

function now() {
  return new Date().toISOString()
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`
}

export class InMemoryDocumentRepository implements DocumentRepository {
  private templates = new Map<string, Template>()
  private documents = new Map<string, Document>()

  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async listTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values())
  }

  async createTemplateFromSystem(
    systemTemplate: SystemTemplate,
  ): Promise<Template> {
    const timestamp = now()
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()
    const existing = Array.from(this.templates.values()).find(
      (template) =>
        template.organizationId === organizationId &&
        template.slug === systemTemplate.slug,
    )

    if (existing) {
      throw new ApiError(
        "TEMPLATE_SLUG_EXISTS",
        "A template with this slug already exists.",
        409,
        { slug: systemTemplate.slug },
      )
    }

    const template: Template = {
      id: newId("template"),
      organizationId,
      name: systemTemplate.name,
      slug: systemTemplate.slug,
      sourceSystemTemplateSlug: systemTemplate.slug,
      content: systemTemplate.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    this.templates.set(template.id, template)
    return template
  }

  async updateTemplate(
    id: string,
    input: TemplateInput,
  ): Promise<Template | null> {
    const currentTemplate = this.templates.get(id)

    if (!currentTemplate) {
      return null
    }

    const duplicate = Array.from(this.templates.values()).find(
      (template) =>
        template.id !== id &&
        template.organizationId === currentTemplate.organizationId &&
        template.slug === input.slug,
    )

    if (duplicate) {
      throw new ApiError(
        "TEMPLATE_SLUG_EXISTS",
        "A template with this slug already exists.",
        409,
        { slug: input.slug },
      )
    }

    const template: Template = {
      ...currentTemplate,
      ...input,
      updatedAt: now(),
    }

    this.templates.set(id, template)
    return template
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id)

    if (deleted) {
      for (const [documentId, document] of this.documents) {
        if (document.templateId === id) {
          this.documents.delete(documentId)
        }
      }
    }

    return deleted
  }

  async listDocumentSummaries(
    sourceHashForTemplate: (template: Template) => string,
  ): Promise<DocumentSummary[]> {
    return Array.from(this.templates.values()).map((template) => {
      const document =
        Array.from(this.documents.values()).find(
          (currentDocument) => currentDocument.templateId === template.id,
        ) ?? null

      return {
        template,
        document,
        status: !document
          ? "not_generated"
          : document.sourceHash === sourceHashForTemplate(template)
            ? "current"
            : "stale",
      }
    })
  }

  async createDocument(input: {
    template: Template
    title: string
    renderedContent: string
    sourceHash: string
  }): Promise<Document> {
    const existingDocument = Array.from(this.documents.values()).find(
      (document) => document.templateId === input.template.id,
    )

    if (existingDocument) {
      throw new ApiError(
        "DOCUMENT_ALREADY_EXISTS",
        "A document has already been generated for this template.",
        409,
        { templateId: input.template.id },
      )
    }

    const document: Document = {
      id: newId("document"),
      organizationId: input.template.organizationId,
      templateId: input.template.id,
      title: input.title,
      renderedContent: input.renderedContent,
      sourceHash: input.sourceHash,
      generatedAt: now(),
    }

    this.documents.set(document.id, document)
    return document
  }

  async getDocument(id: string): Promise<Document | null> {
    return this.documents.get(id) ?? null
  }
}
