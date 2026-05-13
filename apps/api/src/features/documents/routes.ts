import {
  createDocumentSchema,
  createTemplateFromSystemSchema,
  templateInputSchema,
} from "@complyflow/shared"
import { type FastifyInstance } from "fastify"

import {
  Jinja2Renderer,
  ReportContextBuilder,
  templateSourceHash,
} from "../../document-generation.js"
import { ApiError } from "../../errors.js"
import { type SystemTemplateSource } from "../../system-templates.js"
import { type OrganizationRepository } from "../organizations/repository.js"
import { type VendorRepository } from "../vendors/repository.js"
import { type DocumentRepository } from "./repository.js"

export async function registerDocumentRoutes(
  app: FastifyInstance,
  {
    documentRepository,
    organizationRepository,
    systemTemplateSource,
    vendorRepository,
  }: {
    documentRepository: DocumentRepository
    organizationRepository: OrganizationRepository
    systemTemplateSource: SystemTemplateSource
    vendorRepository: VendorRepository
  },
) {
  const contextBuilder = new ReportContextBuilder()
  const renderer = new Jinja2Renderer()

  app.get("/templates", async () => ({
    systemTemplates: await systemTemplateSource.listSystemTemplates(),
    organizationTemplates: await documentRepository.listTemplates(),
  }))

  app.get("/documents", async () => {
    const context = contextBuilder.build({
      organization: await organizationRepository.getOrganization(),
      vendors: await vendorRepository.listVendors(),
    })

    return documentRepository.listDocumentSummaries((template) =>
      templateSourceHash(template, context),
    )
  })

  app.post("/templates/organization", async (request, reply) => {
    const body = createTemplateFromSystemSchema.parse(request.body)
    const systemTemplates = await systemTemplateSource.listSystemTemplates()
    const systemTemplate = systemTemplates.find(
      (template) => template.slug === body.sourceSystemTemplateSlug,
    )

    if (!systemTemplate) {
      throw new ApiError(
        "SYSTEM_TEMPLATE_NOT_FOUND",
        "System template was not found.",
        404,
      )
    }

    const template =
      await documentRepository.createTemplateFromSystem(systemTemplate)

    return reply.status(201).send(template)
  })

  app.put<{ Params: { id: string } }>(
    "/templates/organization/:id",
    async (request, reply) => {
      const body = templateInputSchema.parse(request.body)
      const template = await documentRepository.updateTemplate(
        request.params.id,
        body,
      )

      if (!template) {
        throw new ApiError(
          "TEMPLATE_NOT_FOUND",
          "Template was not found.",
          404,
        )
      }

      return reply.send(template)
    },
  )

  app.delete<{ Params: { id: string } }>(
    "/templates/organization/:id",
    async (request, reply) => {
      const deleted = await documentRepository.deleteTemplate(request.params.id)

      if (!deleted) {
        throw new ApiError("TEMPLATE_NOT_FOUND", "Template was not found.", 404)
      }

      return reply.status(204).send()
    },
  )

  app.post("/documents", async (request, reply) => {
    const body = createDocumentSchema.parse(request.body)
    const templates = await documentRepository.listTemplates()
    const template = templates.find(
      (currentTemplate) => currentTemplate.id === body.templateId,
    )

    if (!template) {
      throw new ApiError("TEMPLATE_NOT_FOUND", "Template was not found.", 404)
    }

    const context = contextBuilder.build({
      organization: await organizationRepository.getOrganization(),
      vendors: await vendorRepository.listVendors(),
    })
    const document = await documentRepository.createDocument({
      template,
      title: template.name,
      renderedContent: renderer.render(template, context),
      sourceHash: templateSourceHash(template, context),
    })

    return reply.status(201).send(document)
  })

  app.get<{ Params: { id: string } }>(
    "/documents/:id",
    async (request, reply) => {
      const document = await documentRepository.getDocument(request.params.id)

      if (!document) {
        throw new ApiError("DOCUMENT_NOT_FOUND", "Document was not found.", 404)
      }

      return reply.send(document)
    },
  )
}
