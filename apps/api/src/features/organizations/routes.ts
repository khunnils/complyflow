import {
  accessProfileSchema,
  companyProfileSchema,
  dataHandlingProfileSchema,
  infrastructureProfileSchema,
} from "@complyflow/shared"
import { type FastifyInstance } from "fastify"
import { z } from "zod"

import { type VendorRepository } from "../vendors/repository.js"
import { type OrganizationRepository } from "./repository.js"

const securityProfileBodySchema = z.object({
  company: companyProfileSchema,
  infrastructure: infrastructureProfileSchema,
  dataHandling: dataHandlingProfileSchema,
  access: accessProfileSchema,
})

export async function registerOrganizationRoutes(
  app: FastifyInstance,
  {
    organizationRepository,
    vendorRepository,
  }: {
    organizationRepository: OrganizationRepository
    vendorRepository: VendorRepository
  },
) {
  app.get("/security-profile", async () => ({
    organization: await organizationRepository.getOrganization(),
    vendors: await vendorRepository.listVendors(),
  }))

  app.put("/security-profile", async (request, reply) => {
    const body = securityProfileBodySchema.parse(request.body)
    const organization = await organizationRepository.upsertProfile(body)
    const vendors = await vendorRepository.listVendors()

    return reply.send({ organization, vendors })
  })
}
