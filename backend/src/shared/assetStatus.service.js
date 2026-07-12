const { prisma } = require('../config/db');
const ALLOWED_TRANSITIONS = {
  Available: ['Allocated', 'Reserved', 'UnderMaintenance', 'Retired', 'Disposed', 'Lost'],
  Allocated: ['Available', 'UnderMaintenance', 'Lost'],
  Reserved: ['Available', 'Allocated', 'UnderMaintenance'],
  UnderMaintenance: ['Available', 'Retired'],
  Lost: ['Available', 'Retired', 'Disposed'],
  Retired: ['Disposed'],
  Disposed: [],
};

/**
 * @param {String} assetId
 * @param {String} newStatus - one of the AssetStatus enum values
 * @param {String} reason - short text for logging
 * @param {String} actorId - Employee.id performing the change
 * @param {Object} [holder] - optional { holderType: 'Employee'|'Department', holderId } or null to clear
 * @returns {Promise<Object>} updated asset
 */
async function updateAssetStatus(assetId, newStatus, reason, actorId, holder = undefined) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    throw new Error(`Asset ${assetId} not found`);
  }

  const currentStatus = asset.status;
  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (currentStatus !== newStatus && !allowedNext.includes(newStatus)) {
    throw new Error(
      `Invalid asset status transition: ${currentStatus} -> ${newStatus} (asset ${assetId}). Reason attempted: ${reason}`
    );
  }

  const data = { status: newStatus };

  if (newStatus === 'Available') {
    data.currentHolderType = null;
    data.currentHolderId = null;
  } else if (holder) {
    data.currentHolderType = holder.holderType;
    data.currentHolderId = holder.holderId;
  }

  const updated = await prisma.asset.update({ where: { id: assetId }, data });

  console.log(
    `[AssetStatus] ${assetId}: ${currentStatus} -> ${newStatus} | reason="${reason}" | actor=${actorId}`
  );

  return updated;
}

module.exports = { updateAssetStatus, ALLOWED_TRANSITIONS };
