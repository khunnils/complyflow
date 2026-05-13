import {
  mapDocumentRecord,
  mapTemplateRecord,
  prisma,
  type PrismaClient,
} from "@complyflow/db"
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

export class PrismaDocumentRepository implements DocumentRepository {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly client: PrismaClient = prisma,
  ) {}

  async listTemplates(): Promise<Template[]> {
    const organization = await this.organizationRepository.getOrganization()

    if (!organization) {
      return []
    }

    const templates = await this.client.template.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "asc" },
    })

    return templates.map(mapTemplateRecord)
  }

  async createTemplateFromSystem(
    systemTemplate: SystemTemplate,
  ): Promise<Template> {
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()

    try {
      const template = await this.client.template.create({
        data: {
          organizationId,
          name: systemTemplate.name,
          slug: systemTemplate.slug,
          sourceSystemTemplateSlug: systemTemplate.slug,
          content: systemTemplate.content,
        },
      })

      return mapTemplateRecord(template)
    } catch (error) {
      this.throwTemplateConflict(error, systemTemplate.slug)
    }
  }

  async updateTemplate(
    id: string,
    input: TemplateInput,
  ): Promise<Template | null> {
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()
    const existing = await this.client.template.findFirst({
      where: { id, organizationId },
    })

    if (!existing) {
      return null
    }

    try {
      const template = await this.client.template.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug,
          content: input.content,
        },
      })

      return mapTemplateRecord(template)
    } catch (error) {
      this.throwTemplateConflict(error, input.slug)
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const organizationId =
      await this.organizationRepository.getOrCreateOrganizationId()
    const existing = await this.client.template.findFirst({
      where: { id, organizationId },
    })

    if (!existing) {
      return false
    }

    await this.client.template.delete({ where: { id } })
    return true
  }

  async listDocumentSummaries(
    sourceHashForTemplate: (template: Template) => string,
  ): Promise<DocumentSummary[]> {
    const organization = await this.organizationRepository.getOrganization()

    if (!organization) {
      return []
    }

    const templates = await this.client.template.findMany({
      where: { organizationId: organization.id },
      include: { documents: true },
      orderBy: { createdAt: "asc" },
    })

    return templates.map((templateRecord) => {
      const template = mapTemplateRecord(templateRecord)
      const documentRecord = templateRecord.documents[0] ?? null
      const document = documentRecord ? mapDocumentRecord(documentRecord) : null

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
    try {
      const document = await this.client.document.create({
        data: {
          organizationId: input.template.organizationId,
          templateId: input.template.id,
          title: input.title,
          renderedContent: input.renderedContent,
          sourceHash: input.sourceHash,
        },
      })

      return mapDocumentRecord(document)
    } catch (error) {
      this.throwDocumentConflict(error, input.template.id)
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    const organization = await this.organizationRepository.getOrganization()

    if (!organization) {
      return null
    }

    const document = await this.client.document.findFirst({
      where: { id, organizationId: organization.id },
    })

    return document ? mapDocumentRecord(document) : null
  }

  private throwTemplateConflict(error: unknown, slug: string): never {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        "TEMPLATE_SLUG_EXISTS",
        "A template with this slug already exists.",
        409,
        { slug },
      )
    }

    throw error
  }

  private throwDocumentConflict(error: unknown, templateId: string): never {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        "DOCUMENT_ALREADY_EXISTS",
        "A document has already been generated for this template.",
        409,
        { templateId },
      )
    }

    throw error
  }
}
