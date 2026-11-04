const cron = require('node-cron');
const Donation = require('../models/Donation');
const { notifyUser, notifyRole } = require('../sockets/socketHandler');

const startExpiryMonitor = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();

      // 1. Process expired donations that are still in AVAILABLE or REQUESTED state
      const expiredDonations = await Donation.find({
        status: { $in: ['AVAILABLE', 'REQUESTED'] },
        expiryTime: { $lte: now },
      });

      for (const donation of expiredDonations) {
        donation.status = 'EXPIRED';
        await donation.save();

        await notifyUser({
          recipientId: donation.donorId,
          title: 'Donation Expired',
          message: `Your donation "${donation.foodName}" has passed its consumption window and is now marked expired.`,
          type: 'warning',
          relatedEntityId: donation._id,
          entityType: 'Donation',
        });
      }

      // 2. Approaching expiry alerts (6h, 3h, 1h)
      const activeDonations = await Donation.find({
        status: 'AVAILABLE',
        expiryTime: { $gt: now },
      });

      for (const donation of activeDonations) {
        const diffHours = (new Date(donation.expiryTime) - now) / (1000 * 60 * 60);

        // 1 Hour Alert (Critical)
        if (diffHours <= 1 && !donation.expiryAlertsSent.oneHour) {
          donation.expiryAlertsSent.oneHour = true;
          await donation.save();

          await notifyUser({
            recipientId: donation.donorId,
            title: 'Critical Expiry: 1 Hour Left!',
            message: `Donation "${donation.foodName}" will expire in less than 60 minutes.`,
            type: 'urgent',
            relatedEntityId: donation._id,
            entityType: 'Donation',
          });

          notifyRole('ngo', 'donation:expiring', {
            donationId: donation._id,
            foodName: donation.foodName,
            hoursRemaining: 1,
          });
        }
        // 3 Hours Alert (Urgent)
        else if (diffHours <= 3 && !donation.expiryAlertsSent.threeHours) {
          donation.expiryAlertsSent.threeHours = true;
          await donation.save();

          await notifyUser({
            recipientId: donation.donorId,
            title: 'Urgent Expiry: 3 Hours Left',
            message: `Donation "${donation.foodName}" expires in approximately 3 hours.`,
            type: 'urgent',
            relatedEntityId: donation._id,
            entityType: 'Donation',
          });
        }
        // 6 Hours Alert (Warning)
        else if (diffHours <= 6 && !donation.expiryAlertsSent.sixHours) {
          donation.expiryAlertsSent.sixHours = true;
          await donation.save();

          await notifyUser({
            recipientId: donation.donorId,
            title: 'Expiry Notice: 6 Hours Left',
            message: `Donation "${donation.foodName}" expires in approximately 6 hours.`,
            type: 'warning',
            relatedEntityId: donation._id,
            entityType: 'Donation',
          });
        }
      }
    } catch (err) {
      console.error('Error running expiry monitor cron job:', err.message);
    }
  });

  console.log('⏰ Food Expiry Background Monitor scheduled (runs every 5 mins)');
};

module.exports = { startExpiryMonitor };
