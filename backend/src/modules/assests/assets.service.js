const Asset = require('../../models/Asset');

async function generateAssetTag() {
  const count = await Asset.countDocuments();
  const next = (count + 1).toString().padStart(4, '0');
  return `AF-${next}`;
}

async function createAsset(payload) {
  const assetTag = await generateAssetTag();
  const asset = await Asset.create({ ...payload, assetTag });
  return asset;
}

async function listAssets(filters = {}) {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.department) query.department = filters.department;
  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.search) {
    query.$or = [
      { assetTag: new RegExp(filters.search, 'i') },
      { serialNumber: new RegExp(filters.search, 'i') },
      { name: new RegExp(filters.search, 'i') },
    ];
  }
  return Asset.find(query).populate('category department').sort({ createdAt: -1 });
}

async function getAssetById(id) {
  const asset = await Asset.findById(id).populate('category department');
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }
  return asset;
}

async function updateAsset(id, payload) {
  // NOTE: do not allow `status` to be updated here directly.
  // Status changes must go through shared/assetStatus.service.js
  delete payload.status;
  const asset = await Asset.findByIdAndUpdate(id, payload, { new: true });
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }
  return asset;
}

module.exports = { createAsset, listAssets, getAssetById, updateAsset, generateAssetTag };
