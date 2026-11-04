import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../services/assignmentService';
import { Compass, MapPin, Building, ExternalLink } from 'lucide-react';
import MapView from '../../components/common/MapView';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function VolunteerRoutesPage() {
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentRoute = async () => {
      try {
        const res = await assignmentService.getAll({
          status: 'PICKUP_IN_PROGRESS',
        });
        if (res.success && res.data?.assignments?.length > 0) {
          setActiveTask(res.data.assignments[0]);
        } else {
          // Fallback to any active assignment
          const anyRes = await assignmentService.getAll();
          if (anyRes.success && anyRes.data?.assignments?.length > 0) {
            setActiveTask(anyRes.data.assignments[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching route', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentRoute();
  }, []);

  if (loading) return <LoadingSpinner text="Mapping active route..." size="lg" />;

  const donorCoords = activeTask?.donorId?.location?.coordinates
    ? [activeTask.donorId.location.coordinates[1], activeTask.donorId.location.coordinates[0]]
    : [11.0268, 76.9958];

  const ngoCoords = activeTask?.ngoId?.location?.coordinates
    ? [activeTask.ngoId.location.coordinates[1], activeTask.ngoId.location.coordinates[0]]
    : [11.0012, 76.9858];

  const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${donorCoords[0]},${donorCoords[1]}&destination=${ngoCoords[0]},${ngoCoords[1]}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brandText-primary tracking-tight">Active Pickup & Delivery Route</h1>
          <p className="text-xs text-brandText-muted mt-0.5">
            Geospatial path connecting the donor kitchen to the destination NGO shelter.
          </p>
        </div>
        <a
          href={navUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-forest-900 text-white rounded-xl text-xs font-bold hover:bg-forest-800 transition shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          Open Live Navigation (Google Maps)
        </a>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-surface-border shadow-sm space-y-4">
        <MapView
          center={donorCoords}
          zoom={13}
          markers={[
            {
              position: donorCoords,
              title: `Origin: ${activeTask?.donorId?.name || 'Donor Kitchen'}`,
              description: activeTask?.donorId?.address || 'Pickup Point',
              type: 'donor',
            },
            {
              position: ngoCoords,
              title: `Destination: ${activeTask?.ngoId?.name || 'NGO Shelter'}`,
              description: activeTask?.ngoId?.address || 'Delivery Point',
              type: 'ngo',
            },
          ]}
          polyline={[donorCoords, ngoCoords]}
          className="h-96 w-full"
        />

        {activeTask && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-2xl bg-surface-light border border-surface-border flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 flex items-center justify-center flex-shrink-0 font-bold">
                A
              </div>
              <div>
                <strong className="block text-brandText-primary">Collection Point: {activeTask.donorId?.name}</strong>
                <p className="text-brandText-muted">{activeTask.donorId?.address}, {activeTask.donorId?.city}</p>
                <p className="text-slate-500 font-mono mt-0.5">Contact: {activeTask.donorId?.phone}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-light border border-surface-border flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0 font-bold">
                B
              </div>
              <div>
                <strong className="block text-brandText-primary">Dropoff Point: {activeTask.ngoId?.name}</strong>
                <p className="text-brandText-muted">{activeTask.ngoId?.address}, {activeTask.ngoId?.city}</p>
                <p className="text-slate-500 font-mono mt-0.5">Contact: {activeTask.ngoId?.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
