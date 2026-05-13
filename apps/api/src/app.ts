import cors from "@fastify/cors"
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify"

import { sendError } from "./errors.js"
import { apiConfig } from "./config.js"
import { InMemoryDocumentRepository } from "./features/documents/in-memory-repository.js"
import { PrismaDocumentRepository } from "./features/documents/prisma-repository.js"
import { type DocumentRepository } from "./features/documents/repository.js"
import { registerDocumentRoutes } from "./features/documents/routes.js"
import { InMemoryOrganizationRepository } from "./features/organizations/in-memory-repository.js"
import { PrismaOrganizationRepository } from "./features/organizations/prisma-repository.js"
import { type OrganizationRepository } from "./features/organizations/repository.js"
import { registerOrganizationRoutes } from "./features/organizations/routes.js"
import { InMemoryVendorRepository } from "./features/vendors/in-memory-repository.js"
import { PrismaVendorRepository } from "./features/vendors/prisma-repository.js"
import { type VendorRepository } from "./features/vendors/repository.js"
import { registerVendorRoutes } from "./features/vendors/routes.js"
import {
  AirtableProviderSource,
  type ProviderSource,
  StaticProviderSource,
} from "./providers.js"
import {
  FileSystemTemplateSource,
  StaticSystemTemplateSource,
  type SystemTemplateSource,
} from "./system-templates.js"

export type CreateAppOptions = {
  organizationRepository?: OrganizationRepository
  vendorRepository?: VendorRepository
  documentRepository?: DocumentRepository
  providerSource?: ProviderSource
  systemTemplateSource?: SystemTemplateSource
  logger?: FastifyServerOptions["logger"]
}

export async function createApp({
  organizationRepository,
  vendorRepository,
  documentRepository,
  providerSource = apiConfig.airtableBase && apiConfig.airtableApiKey
    ? new AirtableProviderSource(
        apiConfig.airtableBase,
        apiConfig.airtableApiKey,
      )
    : new StaticProviderSource(),
  systemTemplateSource = new FileSystemTemplateSource(),
  logger = false,
}: CreateAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger })
  const repositories = createRepositories({
    documentRepository,
    organizationRepository,
    vendorRepository,
  })

  await app.register(cors, {
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: true,
  })

  app.setErrorHandler((error, request, reply) => {
    request.log.error(
      {
        err: error,
        method: request.method,
        url: request.url,
      },
      "request failed",
    )

    return sendError(reply, error)
  })

  app.get("/health", async () => ({ status: "ok" }))

  await registerVendorRoutes(app, {
    providerSource,
    vendorRepository: repositories.vendorRepository,
  })
  await registerOrganizationRoutes(app, {
    organizationRepository: repositories.organizationRepository,
    vendorRepository: repositories.vendorRepository,
  })
  await registerDocumentRoutes(app, {
    documentRepository: repositories.documentRepository,
    organizationRepository: repositories.organizationRepository,
    systemTemplateSource,
    vendorRepository: repositories.vendorRepository,
  })

  return app
}

export function createTestApp() {
  const organizationRepository = new InMemoryOrganizationRepository()
  const vendorRepository = new InMemoryVendorRepository(organizationRepository)
  const documentRepository = new InMemoryDocumentRepository(
    organizationRepository,
  )

  return createApp({
    documentRepository,
    organizationRepository,
    vendorRepository,
    providerSource: new StaticProviderSource([
      {
        id: "prov-github",
        name: "GitHub",
        url: "https://github.com",
        category: "Source Control",
        securityCriticality: "Critical",
        handlesCustomerData: false,
      },
    ]),
    systemTemplateSource: new StaticSystemTemplateSource([
      {
        slug: "security-policy",
        name: "Security Policy",
        description: "A practical starter security policy.",
        content: "# {{ company.name }} Security Policy\n",
      },
      {
        slug: "incident-response-plan",
        name: "Incident Response Plan",
        description: "A lightweight incident response outline.",
        content: "# {{ company.name }} Incident Response Plan\n",
      },
    ]),
  })
}

function createRepositories({
  documentRepository,
  organizationRepository,
  vendorRepository,
}: {
  documentRepository?: DocumentRepository
  organizationRepository?: OrganizationRepository
  vendorRepository?: VendorRepository
}) {
  const resolvedOrganizationRepository =
    organizationRepository ??
    (process.env.DATABASE_URL
      ? new PrismaOrganizationRepository()
      : new InMemoryOrganizationRepository())
  const resolvedVendorRepository =
    vendorRepository ??
    (process.env.DATABASE_URL
      ? new PrismaVendorRepository(resolvedOrganizationRepository)
      : new InMemoryVendorRepository(resolvedOrganizationRepository))
  const resolvedDocumentRepository =
    documentRepository ??
    (process.env.DATABASE_URL
      ? new PrismaDocumentRepository(resolvedOrganizationRepository)
      : new InMemoryDocumentRepository(resolvedOrganizationRepository))

  return {
    documentRepository: resolvedDocumentRepository,
    organizationRepository: resolvedOrganizationRepository,
    vendorRepository: resolvedVendorRepository,
  }
}
