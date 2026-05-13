import {
  type OrganizationSecurityProfile,
  type OrganizationTemplate,
  type OrganizationTemplateInput,
  type SecurityProgramSnapshot,
  type SystemTemplate,
  type Vendor,
  type VendorInput,
} from "@complyflow/shared";

import { ApiError } from "./errors.js";

export type SecurityProfileInput = Pick<
  OrganizationSecurityProfile,
  "company" | "infrastructure" | "dataHandling" | "access"
>;

export interface SecurityProfileRepository {
  getSnapshot(): Promise<SecurityProgramSnapshot>;
  upsertProfile(
    input: SecurityProfileInput,
  ): Promise<OrganizationSecurityProfile>;
  listVendors(): Promise<Vendor[]>;
  createVendor(input: VendorInput): Promise<Vendor>;
  updateVendor(id: string, input: VendorInput): Promise<Vendor | null>;
  deleteVendor(id: string): Promise<boolean>;
  listOrganizationTemplates(): Promise<OrganizationTemplate[]>;
  createOrganizationTemplateFromSystem(
    systemTemplate: SystemTemplate,
  ): Promise<OrganizationTemplate>;
  updateOrganizationTemplate(
    id: string,
    input: OrganizationTemplateInput,
  ): Promise<OrganizationTemplate | null>;
  deleteOrganizationTemplate(id: string): Promise<boolean>;
}

function now() {
  return new Date().toISOString();
}

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export class InMemorySecurityProfileRepository implements SecurityProfileRepository {
  private organization: OrganizationSecurityProfile | null = null;
  private vendors = new Map<string, Vendor>();
  private organizationTemplates = new Map<string, OrganizationTemplate>();

  async getSnapshot(): Promise<SecurityProgramSnapshot> {
    return {
      organization: this.organization,
      vendors: Array.from(this.vendors.values()),
    };
  }

  async upsertProfile(
    input: SecurityProfileInput,
  ): Promise<OrganizationSecurityProfile> {
    const timestamp = now();
    const organization: OrganizationSecurityProfile = {
      id: this.organization?.id ?? newId("org"),
      ...input,
      createdAt: this.organization?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    this.organization = organization;
    return organization;
  }

  async listVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async createVendor(input: VendorInput): Promise<Vendor> {
    const timestamp = now();
    const dataProcessed = this.validVendorDataTypeNames(input);
    const vendor: Vendor = {
      id: newId("vendor"),
      ...input,
      dataProcessed,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.vendors.set(vendor.id, vendor);
    return vendor;
  }

  async updateVendor(id: string, input: VendorInput): Promise<Vendor | null> {
    const currentVendor = this.vendors.get(id);

    if (!currentVendor) {
      return null;
    }

    const dataProcessed = this.validVendorDataTypeNames(input);
    const vendor: Vendor = {
      id,
      ...input,
      dataProcessed,
      createdAt: currentVendor.createdAt,
      updatedAt: now(),
    };

    this.vendors.set(id, vendor);
    return vendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    return this.vendors.delete(id);
  }

  async listOrganizationTemplates(): Promise<OrganizationTemplate[]> {
    return Array.from(this.organizationTemplates.values());
  }

  async createOrganizationTemplateFromSystem(
    systemTemplate: SystemTemplate,
  ): Promise<OrganizationTemplate> {
    const timestamp = now();
    const organizationId = this.getOrCreateOrganizationId();
    const existing = Array.from(this.organizationTemplates.values()).find(
      (template) =>
        template.organizationId === organizationId &&
        template.slug === systemTemplate.slug,
    );

    if (existing) {
      throw new ApiError(
        "ORGANIZATION_TEMPLATE_SLUG_EXISTS",
        "An organization template with this slug already exists.",
        409,
        { slug: systemTemplate.slug },
      );
    }

    const template: OrganizationTemplate = {
      id: newId("template"),
      organizationId,
      name: systemTemplate.name,
      slug: systemTemplate.slug,
      sourceSystemTemplateSlug: systemTemplate.slug,
      content: systemTemplate.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.organizationTemplates.set(template.id, template);
    return template;
  }

  async updateOrganizationTemplate(
    id: string,
    input: OrganizationTemplateInput,
  ): Promise<OrganizationTemplate | null> {
    const currentTemplate = this.organizationTemplates.get(id);

    if (!currentTemplate) {
      return null;
    }

    const duplicate = Array.from(this.organizationTemplates.values()).find(
      (template) =>
        template.id !== id &&
        template.organizationId === currentTemplate.organizationId &&
        template.slug === input.slug,
    );

    if (duplicate) {
      throw new ApiError(
        "ORGANIZATION_TEMPLATE_SLUG_EXISTS",
        "An organization template with this slug already exists.",
        409,
        { slug: input.slug },
      );
    }

    const template: OrganizationTemplate = {
      ...currentTemplate,
      ...input,
      updatedAt: now(),
    };

    this.organizationTemplates.set(id, template);
    return template;
  }

  async deleteOrganizationTemplate(id: string): Promise<boolean> {
    return this.organizationTemplates.delete(id);
  }

  private validVendorDataTypeNames(input: VendorInput) {
    if (input.dataProcessingLevel === "none") {
      return [];
    }

    const requestedNames = Array.from(new Set(input.dataProcessed));

    if (requestedNames.length === 0) {
      return [];
    }

    const organizationDataTypeNames = new Set(
      this.organization?.dataHandling.dataTypesStored.map(
        (dataType) => dataType.name,
      ) ?? [],
    );
    const missingNames = requestedNames.filter(
      (name) => !organizationDataTypeNames.has(name),
    );

    if (missingNames.length > 0) {
      throw new ApiError(
        "VENDOR_DATA_TYPE_NOT_FOUND",
        "Vendor data processed must reference data types stored on the organization.",
        400,
        { dataProcessed: missingNames },
      );
    }

    return requestedNames;
  }

  private getOrCreateOrganizationId() {
    if (!this.organization) {
      const timestamp = now();

      this.organization = {
        id: newId("org"),
        company: {
          companyName: "Untitled company",
          employeeCount: 1,
          industries: [],
          regions: [],
          handlesPii: false,
          handlesSensitiveData: false,
          complianceGoals: [],
        },
        infrastructure: {
          cloudProviders: [],
          sourceControlProvider: "",
          authProvider: "",
          passwordManager: "",
          mfaEnabled: false,
          encryptedDevicesRequired: false,
          backupsEnabled: false,
          centralizedLoggingEnabled: false,
        },
        dataHandling: {
          dataTypesStored: [],
          storesPii: false,
          storesHealthcareData: false,
          encryptionAtRest: false,
          encryptionInTransit: false,
          productionDataInDevelopment: false,
          retentionPolicyExists: false,
        },
        access: {
          mfaRequired: false,
          ssoEnabled: false,
          sharedAccountsExist: false,
          offboardingProcessExists: false,
          accessReviewsPerformed: false,
          privilegedAccessRestricted: false,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }

    return this.organization.id;
  }
}
