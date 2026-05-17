import { createHash } from "node:crypto"

import nunjucks from "nunjucks"
import {
  type SecurityProgramSnapshot,
  type Template,
  type Vendor,
} from "@plyco/shared"

export type NormalizedTemplateContext = {
  organization: Record<string, unknown>
  company: Record<string, unknown>
  infrastructure: Record<string, unknown>
  dataHandling: Record<string, unknown>
  access: Record<string, unknown>
  vendors: {
    all: Array<Record<string, unknown>>
    dataProcessors: Array<Record<string, unknown>>
    subprocessors: Array<Record<string, unknown>>
  }
}

export class ReportContextBuilder {
  build(snapshot: SecurityProgramSnapshot): NormalizedTemplateContext {
    const organization = snapshot.organization
    const organizationContext = organization
      ? {
          ...organization.company,
          name: organization.company.companyName,
        }
      : {}
    const vendors = snapshot.vendors.map((vendor) => this.vendorContext(vendor))

    return {
      organization: organizationContext,
      company: organizationContext,
      infrastructure: organization?.infrastructure ?? {},
      dataHandling: organization?.dataHandling ?? {},
      access: organization?.access ?? {},
      vendors: {
        all: vendors,
        dataProcessors: vendors.filter((vendor) =>
          ["limited", "subprocessor"].includes(
            String(vendor.dataProcessingLevel),
          ),
        ),
        subprocessors: vendors.filter(
          (vendor) => vendor.dataProcessingLevel === "subprocessor",
        ),
      },
    }
  }

  private vendorContext(vendor: Vendor) {
    return {
      name: vendor.name,
      category: vendor.category,
      purpose: vendor.purpose,
      countryOfRegistration: vendor.countryOfRegistration,
      hasSubprocessors: vendor.hasSubprocessors,
      dataProcessingLevel: vendor.dataProcessingLevel,
      dataProcessed: vendor.dataProcessed,
      dpaStatus: vendor.dpaStatus,
      dataRegions: vendor.dataRegions,
      criticality: vendor.criticality,
      owner: vendor.owner,
      notes: vendor.notes,
    }
  }
}

export class Jinja2Renderer {
  render(template: Template, context: NormalizedTemplateContext): string {
    return nunjucks.renderString(template.content, context)
  }
}

export function templateSourceHash(
  template: Pick<Template, "content">,
  context: NormalizedTemplateContext,
) {
  return createHash("sha256")
    .update(stableStringify({ content: template.content, context }))
    .digest("hex")
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`
  }

  return JSON.stringify(value)
}
