# Leads Module (CRM)

## Overview
The Leads Module acts as a lightweight CRM within the Headless E-Commerce Admin Panel. It is designed to track potential customers across various acquisition channels and manage them through a sales funnel.

## Data Model
The `Lead` model (`apps/api/src/models/Lead.ts`) stores the following key information:
- **Tenant & Store association**: Multi-tenant and multi-store ready (`tenantId`, `storeId`).
- **Basic Info**: Name, Email, Phone.
- **Source**: Where the lead came from (`Website`, `Instagram`, `WhatsApp`, `Manual`, `Other`).
- **Status**: The current state in the funnel (`New`, `Contacted`, `Qualified`, `Proposal`, `Won`, `Lost`).
- **Interest Level & Priority**: To help sales staff prioritize (`High`, `Medium`, `Low`).
- **Additional Data**: Product requirements, budget, location, and internal notes.
- **Assignment**: Can be assigned to specific staff members.

## Features
- **Lead Tracking**: Keep track of leads from initial contact to closing.
- **Filtering**: Indexes are in place for fast filtering by `storeId`, `status`, and `followUpPriority`.
- **Integration Ready**: Serves as the foundation for integrations with WhatsApp, Instagram DMs, etc.
