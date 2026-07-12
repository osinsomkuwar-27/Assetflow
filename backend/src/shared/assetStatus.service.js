const Asset = require('../models/Asset');

/**
 * THE SINGLE SOURCE OF TRUTH for changing an Asset's lifecycle status.
 * Every module (Allocation, Booking, Maintenance, Audit) MUST call this
 * instead of writing `asset.status = ...` directly. This prevents two
 * modules from racing to overwrite each other's status changes and keeps
 * one place to enforce valid transitions.
 *
 * Valid statuses: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
 */

const ALLOWED_TRANSITIONS = {
  Available: ['Allocated', 'Reserved', 'Under Maintenance', 'Retired', 'Disposed', 'Lost'],
  Allocated: ['Available', 'Under Maintenance', 'Lost'],
  Reserved: ['Available', 'Allocated', 'Under Maintenance'],
  'Under Maintenance': ['Available', 'Retired'],
  Lost: ['Available', 'Retired', 'Disposed'], 
  Retired: ['Disposed'],
  Disposed: [], 
};

/**
 * @param {String} assetId
 * @param {String} newStatus - one of the ASSET_STATUSES
 * @param {String} reason - short text, e.g. "Allocated to employee X", "Maintenance approved"
 * @param {String} actorId - Employee._id performing the change (for audit logging)
 * @param {Object} [holder] - optional { holderType: 'Employee'|'Department', holderId }
 * @returns {Promise<Object>} updated asset
 */
async function updateAssetStatus(assetId, newStatus, reason, actorId, holder = null) {
  const asset = await Asset.findById(assetId);
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

  asset.status = newStatus;

  if (holder !== null) {
    asset.currentHolder = holder;
  }
  if (newStatus === 'Available') {
    asset.currentHolder = { holderType: null, holderId: null };
  }

  await asset.save();
  console.log(
    `[AssetStatus] ${assetId}: ${currentStatus} -> ${newStatus} | reason="${reason}" | actor=${actorId}`
  );

  return asset;
}

module.exports = { updateAssetStatus, ALLOWED_TRANSITIONS };
