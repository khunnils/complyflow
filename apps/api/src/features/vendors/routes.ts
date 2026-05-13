import { vendorInputSchema } from "@complyflow/shared"
import { type FastifyInstance } from "fastify"

import { ApiError } from "../../errors.js"
import { type ProviderSource } from "../../providers.js"
import { type VendorRepository } from "./repository.js"

export async function registerVendorRoutes(
  app: FastifyInstance,
  {
    providerSource,
    vendorRepository,
  }: {
    providerSource: ProviderSource
    vendorRepository: VendorRepository
  },
) {
  app.get("/providers", async () => providerSource.listProviders())

  app.get("/vendors", async () => vendorRepository.listVendors())

  app.post("/vendors", async (request, reply) => {
    const body = vendorInputSchema.parse(request.body)
    const vendor = await vendorRepository.createVendor(body)

    return reply.status(201).send(vendor)
  })

  app.put<{ Params: { id: string } }>(
    "/vendors/:id",
    async (request, reply) => {
      const body = vendorInputSchema.parse(request.body)
      const vendor = await vendorRepository.updateVendor(
        request.params.id,
        body,
      )

      if (!vendor) {
        throw new ApiError("VENDOR_NOT_FOUND", "Vendor was not found.", 404)
      }

      return reply.send(vendor)
    },
  )

  app.delete<{ Params: { id: string } }>(
    "/vendors/:id",
    async (request, reply) => {
      const deleted = await vendorRepository.deleteVendor(request.params.id)

      if (!deleted) {
        throw new ApiError("VENDOR_NOT_FOUND", "Vendor was not found.", 404)
      }

      return reply.status(204).send()
    },
  )
}
