-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Employee', 'DepartmentHead', 'AssetManager', 'Admin');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('Available', 'Allocated', 'Reserved', 'UnderMaintenance', 'Lost', 'Retired', 'Disposed');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('New', 'Good', 'Fair', 'Poor', 'Damaged');

-- CreateEnum
CREATE TYPE "HolderType" AS ENUM ('Employee', 'Department');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('Active', 'Returned');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('Requested', 'Approved', 'Rejected', 'Reallocated');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Upcoming', 'Ongoing', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'TechnicianAssigned', 'InProgress', 'Resolved');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- CreateEnum
CREATE TYPE "AuditCycleStatus" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('Pending', 'Verified', 'Missing', 'Damaged');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AssetAssigned', 'MaintenanceApproved', 'MaintenanceRejected', 'BookingConfirmed', 'BookingCancelled', 'BookingReminder', 'TransferApproved', 'OverdueReturn', 'AuditDiscrepancyFlagged');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "headId" TEXT,
    "parentId" TEXT,
    "status" "ActiveStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customFields" JSONB,
    "status" "ActiveStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "departmentId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'Employee',
    "status" "ActiveStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "acquisitionDate" TIMESTAMP(3),
    "acquisitionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "condition" "Condition" NOT NULL DEFAULT 'Good',
    "location" TEXT,
    "departmentId" TEXT,
    "photoUrl" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isBookable" BOOLEAN NOT NULL DEFAULT false,
    "status" "AssetStatus" NOT NULL DEFAULT 'Available',
    "currentHolderType" "HolderType",
    "currentHolderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "holderType" "HolderType" NOT NULL,
    "holderId" TEXT NOT NULL,
    "allocatedById" TEXT NOT NULL,
    "expectedReturnDate" TIMESTAMP(3),
    "actualReturnDate" TIMESTAMP(3),
    "conditionAtCheckIn" TEXT,
    "checkInNotes" TEXT,
    "status" "AllocationStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferRequest" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "fromAllocationId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedHolderType" "HolderType" NOT NULL,
    "requestedHolderId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'Requested',
    "approvedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "bookedById" TEXT NOT NULL,
    "departmentId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'Upcoming',
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'Medium',
    "photoUrl" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'Pending',
    "approvedById" TEXT,
    "technician" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditCycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scopeDepartment" TEXT,
    "scopeLocation" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "auditorIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "AuditCycleStatus" NOT NULL DEFAULT 'Open',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditItem" (
    "id" TEXT NOT NULL,
    "auditCycleId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "verifiedById" TEXT,
    "result" "AuditResult" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "relatedEntity" TEXT,
    "relatedId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");

-- CreateIndex
CREATE INDEX "Booking_assetId_startTime_endTime_idx" ON "Booking"("assetId", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_allocatedById_fkey" FOREIGN KEY ("allocatedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_fromAllocationId_fkey" FOREIGN KEY ("fromAllocationId") REFERENCES "Allocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookedById_fkey" FOREIGN KEY ("bookedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditCycle" ADD CONSTRAINT "AuditCycle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_auditCycleId_fkey" FOREIGN KEY ("auditCycleId") REFERENCES "AuditCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditItem" ADD CONSTRAINT "AuditItem_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
