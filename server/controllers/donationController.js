const Donation = require('../models/Donation');
const DonorProfile = require('../models/DonorProfile');
const { getFileUrl } = require('../middleware/upload');
const { notifyRole } = require('../sockets/socketHandler');
const { normalizeToKg, calculateDistanceKm } = require('../utils/distance');

exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      city,
      status = 'AVAILABLE',
      sortBy = 'expiryTime',
      sortOrder = 'asc',
      latitude,
      longitude,
      radius,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    // Exclude expired listings for public discovery
    if (status === 'AVAILABLE') {
      query.expiryTime = { $gt: new Date() };
    }

    if (category) {
      query.foodCategory = category;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { foodName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { foodCategory: { $regex: search, $options: 'i' } },
      ];
    }

    // Check if coordinates were provided for distance sorting
    const hasCoordinates =
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== '' &&
      longitude !== '' &&
      !isNaN(parseFloat(latitude)) &&
      !isNaN(parseFloat(longitude));

    const parsedLat = hasCoordinates ? parseFloat(latitude) : null;
    const parsedLng = hasCoordinates ? parseFloat(longitude) : null;

    if (hasCoordinates) {
      const nearQuery = {
        $geometry: {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
        },
      };

      // Apply maxDistance only when radius is explicitly specified by caller
      if (radius && !isNaN(parseFloat(radius))) {
        nearQuery.$maxDistance = parseFloat(radius) * 1000;
      }

      query.location = {
        $near: nearQuery,
      };
    }

    const sortOptions = {};
    if (!hasCoordinates) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // MongoDB countDocuments does not support $near/$geoNear.
    // Use $geoWithin with $centerSphere for countDocuments, or remove location if no radius limit.
    const countQuery = { ...query };
    if (hasCoordinates) {
      if (query.location?.$near?.$maxDistance) {
        const radiusKm = query.location.$near.$maxDistance / 1000;
        const radiusInRadians = radiusKm / 6378.1;
        countQuery.location = {
          $geoWithin: {
            $centerSphere: [[parsedLng, parsedLat], radiusInRadians],
          },
        };
      } else {
        delete countQuery.location;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let donations;
    let total;

    try {
      [donations, total] = await Promise.all([
        Donation.find(query)
          .populate('donorId', 'name city')
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Donation.countDocuments(countQuery),
      ]);
    } catch (geoError) {
      // Graceful fallback for environments with missing or rebuilding 2dsphere index
      if (hasCoordinates) {
        console.warn('Geospatial native query fallback to in-memory Haversine distance calculation:', geoError.message);
        const fallbackQuery = { ...query };
        delete fallbackQuery.location;

        const allCandidates = await Donation.find(fallbackQuery)
          .populate('donorId', 'name city')
          .sort(sortOptions);

        // Sort candidate listings by Haversine great-circle distance
        allCandidates.sort((a, b) => {
          const aCoords = a.location?.coordinates || [0, 0];
          const bCoords = b.location?.coordinates || [0, 0];
          const distA = calculateDistanceKm(parsedLat, parsedLng, aCoords[1], aCoords[0]);
          const distB = calculateDistanceKm(parsedLat, parsedLng, bCoords[1], bCoords[0]);
          return distA - distB;
        });

        let filtered = allCandidates;
        if (radius && !isNaN(parseFloat(radius))) {
          const maxKm = parseFloat(radius);
          filtered = allCandidates.filter((item) => {
            const coords = item.location?.coordinates || [0, 0];
            return calculateDistanceKm(parsedLat, parsedLng, coords[1], coords[0]) <= maxKm;
          });
        }

        total = filtered.length;
        donations = filtered.slice(skip, skip + parseInt(limit));
      } else {
        throw geoError;
      }
    }

    // Attach calculated distanceKm to each record when user provided coordinates
    const formattedDonations = donations.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      if (
        hasCoordinates &&
        obj.location &&
        Array.isArray(obj.location.coordinates) &&
        obj.location.coordinates.length === 2
      ) {
        const [donLon, donLat] = obj.location.coordinates;
        obj.distanceKm = calculateDistanceKm(parsedLat, parsedLng, donLat, donLon);
      }
      return obj;
    });

    res.json({
      success: true,
      data: {
        donations: formattedDonations,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donorId', 'name city organizationType');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    res.json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

exports.getMyDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { donorId: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('acceptedRequestId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Donation.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        donations,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      foodName,
      description,
      foodCategory,
      foodType,
      quantity,
      unit,
      servings,
      preparedAt,
      expiryTime,
      pickupStartTime,
      pickupEndTime,
      storageCondition,
      allergens,
      packagingCondition,
      specialInstructions,
      address,
      city,
      state,
      postalCode,
      latitude,
      longitude,
    } = req.body;

    const numQuantity = parseFloat(quantity);
    if (!numQuantity || numQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
    }

    const expiryDate = new Date(expiryTime);
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Expiry time must be in the future' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = await getFileUrl(req, req.file);
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    // Default image if none provided
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
    }

    const parsedAllergens = Array.isArray(allergens)
      ? allergens
      : typeof allergens === 'string' && allergens.trim()
      ? allergens.split(',').map((s) => s.trim())
      : [];

    const coordinates = [
      parseFloat(longitude) || 76.9558,
      parseFloat(latitude) || 11.0168,
    ];

    const donation = await Donation.create({
      donorId: req.user._id,
      foodName,
      description,
      foodCategory,
      foodType: foodType || 'cooked',
      quantity: numQuantity,
      unit: unit || 'kg',
      servings: parseInt(servings) || Math.round(numQuantity * 2.2),
      preparedAt: preparedAt ? new Date(preparedAt) : new Date(),
      expiryTime: expiryDate,
      pickupStartTime: pickupStartTime ? new Date(pickupStartTime) : new Date(),
      pickupEndTime: pickupEndTime ? new Date(pickupEndTime) : expiryDate,
      storageCondition: storageCondition || 'ambient',
      allergens: parsedAllergens,
      imageUrl,
      packagingCondition: packagingCondition || 'Hygienically packaged',
      specialInstructions: specialInstructions || '',
      address: address || req.user.address,
      city: city || req.user.city || 'Coimbatore',
      state: state || req.user.state || 'Tamil Nadu',
      postalCode: postalCode || req.user.postalCode,
      location: {
        type: 'Point',
        coordinates,
      },
      status: 'AVAILABLE',
    });

    // Update Donor Profile total donations
    await DonorProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $inc: { totalDonations: 1, totalFoodDonatedKg: normalizeToKg(numQuantity, unit) } }
    );

    // Broadcast new donation event to verified NGOs
    notifyRole('ngo', 'donation:created', {
      donationId: donation._id,
      foodName: donation.foodName,
      quantity: donation.quantity,
      unit: donation.unit,
      city: donation.city,
    });

    res.status(201).json({
      success: true,
      message: 'Donation published successfully',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Ownership check: Donors can ONLY alter their own donations
    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this donation record' });
    }

    if (donation.status !== 'AVAILABLE' && donation.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit donation once it is in ${donation.status} status.`,
      });
    }

    const {
      foodName,
      description,
      foodCategory,
      quantity,
      unit,
      servings,
      expiryTime,
      storageCondition,
      specialInstructions,
    } = req.body;

    if (foodName) donation.foodName = foodName;
    if (description !== undefined) donation.description = description;
    if (foodCategory) donation.foodCategory = foodCategory;
    if (quantity) donation.quantity = parseFloat(quantity);
    if (unit) donation.unit = unit;
    if (servings) donation.servings = parseInt(servings);
    if (expiryTime) donation.expiryTime = new Date(expiryTime);
    if (storageCondition) donation.storageCondition = storageCondition;
    if (specialInstructions !== undefined) donation.specialInstructions = specialInstructions;

    if (req.file) {
      donation.imageUrl = await getFileUrl(req, req.file);
    }

    await donation.save();

    res.json({ success: true, message: 'Donation updated successfully', data: donation });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this donation record' });
    }

    if (donation.status === 'ACCEPTED' || donation.status === 'PICKUP_IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an active donation with committed volunteer pickup.',
      });
    }

    await donation.deleteOne();

    res.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.donorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    donation.status = 'CANCELLED';
    await donation.save();

    res.json({ success: true, message: 'Donation cancelled', data: donation });
  } catch (error) {
    next(error);
  }
};

exports.getStatistics = async (req, res, next) => {
  try {
    const donorId = req.user._id;

    const [availableCount, requestedCount, acceptedCount, completedCount, allDonations] = await Promise.all([
      Donation.countDocuments({ donorId, status: 'AVAILABLE' }),
      Donation.countDocuments({ donorId, status: 'REQUESTED' }),
      Donation.countDocuments({ donorId, status: { $in: ['ACCEPTED', 'VOLUNTEER_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'DELIVERED'] } }),
      Donation.countDocuments({ donorId, status: 'COMPLETED' }),
      Donation.find({ donorId }),
    ]);

    let totalKgRescued = 0;
    allDonations.forEach((d) => {
      if (d.status === 'COMPLETED' || d.status === 'DELIVERED') {
        totalKgRescued += normalizeToKg(d.quantity, d.unit);
      }
    });

    res.json({
      success: true,
      data: {
        totalDonations: allDonations.length,
        availableDonations: availableCount,
        pendingRequests: requestedCount,
        acceptedDonations: acceptedCount,
        completedDonations: completedCount,
        totalFoodRescuedKg: Number(totalKgRescued.toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
};
