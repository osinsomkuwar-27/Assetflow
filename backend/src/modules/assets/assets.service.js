const { prisma } = require('../../config/db');

async function generateAssetTag() {
  const count = await prisma.asset.count();
  const next = (count + 1).toString().padStart(4, '0');
  return `AF-${next}`;
}

async function createAsset(payload) {
  const assetTag = await generateAssetTag();
  const asset = await prisma.asset.create({
    data: {
      name: payload.name,
      categoryId: payload.category,
      serialNumber: payload.serialNumber || null,
      acquisitionDate: payload.acquisitionDate ? new Date(payload.acquisitionDate) : null,
      acquisitionCost: payload.acquisitionCost || 0,
      condition: payload.condition || 'Good',
      location: payload.location || null,
      departmentId: payload.department || null,
      photoUrl: payload.photoUrl || null,
      documents: payload.documents || [],
      isBookable: payload.isBookable || false,
      assetTag,
    },
  });
  return asset;
}

async function listAssets(filters = {}) {
  const where = {};
  if (filters.category) where.categoryId = filters.category;
  if (filters.status) where.status = filters.status;
  if (filters.department) where.departmentId = filters.department;
  if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
  if (filters.search) {
    where.OR = [
      { assetTag: { contains: filters.search, mode: 'insensitive' } },
      { serialNumber: { contains: filters.search, mode: 'insensitive' } },
      { name: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  return prisma.asset.findMany({
    where,
    include: { category: true, department: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getAssetById(id) {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: { category: true, department: true },
  });
  if (!asset) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }
  return asset;
}

async function updateAsset(id, payload) {
  delete payload.status;
  delete payload.category; 
  delete payload.department;

  const data = { ...payload };
  if (payload.categoryId) data.categoryId = payload.categoryId;
  if (payload.departmentId) data.departmentId = payload.departmentId;
  if (payload.acquisitionDate) data.acquisitionDate = new Date(payload.acquisitionDate);

  try {
    const asset = await prisma.asset.update({ where: { id }, data });
    return asset;
  } catch (e) {
    const err = new Error('Asset not found');
    err.statusCode = 404;
    throw err;
  }
}

module.exports = { createAsset, listAssets, getAssetById, updateAsset, generateAssetTag };
