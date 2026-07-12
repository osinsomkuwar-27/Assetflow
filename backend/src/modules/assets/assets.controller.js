const assetsService = require('./assets.service');
const { ok, fail } = require('../../shared/utils/responseFormatter');

async function create(req, res, next) {
  try {
    const { name, category, serialNumber, acquisitionDate, acquisitionCost, condition, location, department, isBookable, photoUrl, documents } = req.body;
    if (!name || !category) return fail(res, 'name and category are required', 400);

    const asset = await assetsService.createAsset({
      name, category, serialNumber, acquisitionDate, acquisitionCost, condition, location, department, isBookable, photoUrl, documents,
    });
    return ok(res, asset, 'Asset registered', 201);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { category, status, department, location, search } = req.query;
    const assets = await assetsService.listAssets({ category, status, department, location, search });
    return ok(res, assets, 'Assets fetched');
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const asset = await assetsService.getAssetById(req.params.id);
    return ok(res, asset, 'Asset fetched');
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const asset = await assetsService.updateAsset(req.params.id, req.body);
    return ok(res, asset, 'Asset updated');
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getOne, update };
