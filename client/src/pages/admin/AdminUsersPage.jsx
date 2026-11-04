import React, { useState, useEffect, useRef, useMemo } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserX,
  UserCheck,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Trash2,
  X,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import CustomSelect from '../../components/common/CustomSelect';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedUserId, setHighlightedUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchContainerRef = useRef(null);

  // Debounce search input for background fetching without breaking UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users: show full spinner only on initial load or role/status filter change
  const fetchUsers = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await adminService.getUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
        limit: 100,
      });
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      fetchUsers(false);
    }
  }, [debouncedSearch]);

  // Close recommendations on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
    setIsSearchFocused(false);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await adminService.updateUserStatus(userId, newStatus);
      if (res.success) {
        toast.success(`User account status updated to ${newStatus}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminService.deleteUser(deleteTarget._id);
      if (res.success) {
        toast.success('Volunteer removed successfully');
        setDeleteTarget(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Error removing volunteer');
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayName = (user) => {
    const name = (user.name || '').trim();
    if (name && name.toLowerCase() !== 'volunteer') return name;
    const email = (user.email || '').trim();
    if (email) return email.split('@')[0];
    return 'Unnamed user';
  };

  // Instant Recommendations computation (matching when typing 1 or more characters)
  const recommendations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return users
      .filter((u) => {
        const nameMatch = u.name?.toLowerCase().includes(query);
        const emailMatch = u.email?.toLowerCase().includes(query);
        const phoneMatch = u.phone?.toLowerCase().includes(query);
        const cityMatch = u.city?.toLowerCase().includes(query);
        const roleMatch = u.role?.toLowerCase().includes(query);
        return nameMatch || emailMatch || phoneMatch || cityMatch || roleMatch;
      })
      .sort((a, b) => {
        // Prioritize items starting with query
        const aStarts =
          a.name?.toLowerCase().startsWith(query) || a.email?.toLowerCase().startsWith(query);
        const bStarts =
          b.name?.toLowerCase().startsWith(query) || b.email?.toLowerCase().startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      })
      .slice(0, 6);
  }, [search, users]);

  // Displayed users with matching users dynamically surfaced to the VERY TOP of the table
  const displayedUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    const matches = [];
    const nonMatches = [];

    users.forEach((u) => {
      const nameMatch = u.name?.toLowerCase().includes(query);
      const emailMatch = u.email?.toLowerCase().includes(query);
      const phoneMatch = u.phone?.toLowerCase().includes(query);
      const cityMatch = u.city?.toLowerCase().includes(query);
      const roleMatch = u.role?.toLowerCase().includes(query);

      if (nameMatch || emailMatch || phoneMatch || cityMatch || roleMatch) {
        matches.push(u);
      } else {
        nonMatches.push(u);
      }
    });

    // Sort matches: items starting with query at the absolute top
    matches.sort((a, b) => {
      const aStarts =
        a.name?.toLowerCase().startsWith(query) || a.email?.toLowerCase().startsWith(query);
      const bStarts =
        b.name?.toLowerCase().startsWith(query) || b.email?.toLowerCase().startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    // When searching, surface all matching users directly at the very top of the table!
    return matches.length > 0 ? [...matches, ...nonMatches] : users;
  }, [search, users]);

  // Set of matching user IDs for row highlighting
  const matchingUserIds = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return new Set();
    const ids = new Set();
    users.forEach((u) => {
      const nameMatch = u.name?.toLowerCase().includes(query);
      const emailMatch = u.email?.toLowerCase().includes(query);
      const phoneMatch = u.phone?.toLowerCase().includes(query);
      const cityMatch = u.city?.toLowerCase().includes(query);
      const roleMatch = u.role?.toLowerCase().includes(query);
      if (nameMatch || emailMatch || phoneMatch || cityMatch || roleMatch) {
        ids.add(u._id);
      }
    });
    return ids;
  }, [search, users]);

  const selectRecommendation = (user) => {
    setSearch(getDisplayName(user));
    setHighlightedUserId(user._id);
    setIsSearchFocused(false);

    // Auto-clear highlight ring after 4 seconds
    setTimeout(() => {
      setHighlightedUserId(null);
    }, 4000);
  };

  const clearSearch = () => {
    setSearch('');
    setIsSearchFocused(false);
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'donor':
        return 'bg-amber-100 text-amber-950 border border-amber-400 font-extrabold';
      case 'ngo':
        return 'bg-emerald-100 text-emerald-950 border border-emerald-400 font-extrabold';
      case 'volunteer':
        return 'bg-cyan-100 text-cyan-950 border border-cyan-400 font-extrabold';
      case 'admin':
        return 'bg-purple-100 text-purple-950 border border-purple-400 font-extrabold';
      default:
        return 'bg-slate-200 text-slate-950 border border-slate-400 font-extrabold';
    }
  };

  // Helper to highlight matching characters in dark green
  const renderHighlightedText = (text, query) => {
    if (!text) return '';
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={index}
          className="bg-emerald-300 text-emerald-950 font-black rounded-xs px-1 shadow-2xs"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title - High Contrast Crisp White & Emerald */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" />
            Platform Users & Roles
          </h1>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            Manage user accounts, roles, verified credentials, and account statuses across FoodLink.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box with Autocomplete Popover */}
          <div ref={searchContainerRef} className="relative flex-1">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-950 font-bold pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search users by name, email, phone, or city..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border-2 border-slate-300 text-slate-950 font-black bg-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30 shadow-xs"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-950 p-1"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-4 h-4 text-white" />
                <span>Search</span>
              </button>
            </form>

            {/* Instant Recommendations Dropdown Popover */}
            {isSearchFocused && search.trim().length >= 1 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border-2 border-emerald-600 shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>Top Recommended Users ({recommendations.length} found)</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-900">
                    Type to refine • Click to surface at top
                  </span>
                </div>

                {recommendations.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs font-black text-slate-950">
                      No matching user found for "{search}"
                    </p>
                    <p className="text-[11px] font-bold text-emerald-950 mt-0.5">
                      Check spelling or try searching by role or city name.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {recommendations.map((recUser, index) => (
                      <button
                        key={recUser._id}
                        type="button"
                        onClick={() => selectRecommendation(recUser)}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                          index === 0 ? 'bg-emerald-50/60' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar Circle */}
                          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {getDisplayName(recUser)[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-black text-slate-950">
                                {renderHighlightedText(getDisplayName(recUser), search.trim())}
                              </span>
                              <span
                                className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${getRoleBadgeStyle(
                                  recUser.role
                                )}`}
                              >
                                {recUser.role}
                              </span>
                            </div>
                            <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1 mt-0.5 truncate">
                              <Mail className="w-3 h-3 text-emerald-800 shrink-0" />
                              <span>{renderHighlightedText(recUser.email, search.trim())}</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-950 flex items-center gap-2 mt-0.5">
                              {recUser.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5 text-slate-800" />
                                  {recUser.phone}
                                </span>
                              )}
                              {recUser.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-slate-800" />
                                  {recUser.city}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 pl-3">
                          {index === 0 && (
                            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-emerald-950 bg-emerald-200 border border-emerald-400 px-2 py-0.5 rounded-md">
                              ⭐ Top Match
                            </span>
                          )}
                          <div className="w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-200 flex items-center justify-center text-slate-950">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Role and Status Filters with High-Contrast Custom Dropdowns (immune to Chrome dark-mode OS bugs) */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <CustomSelect
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'donor', label: 'Donors' },
                { value: 'ngo', label: 'NGOs' },
                { value: 'volunteer', label: 'Volunteers' },
                { value: 'admin', label: 'Admins' },
              ]}
              placeholder="All Roles"
              className="w-full sm:w-auto"
            />

            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="All Statuses"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Live Search Indicator */}
        {search && (
          <div className="mt-3 pt-3 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-950 font-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Showing results for:</span>
              <span className="bg-emerald-100 text-emerald-950 px-2.5 py-0.5 rounded-md font-black border border-emerald-400">
                "{search}"
              </span>
              <span className="text-emerald-950 font-black">
                ({displayedUsers.length} user{displayedUsers.length === 1 ? '' : 's'} • {matchingUserIds.size} match{matchingUserIds.size === 1 ? '' : 'es'} at top)
              </span>
            </div>
            <button
              onClick={clearSearch}
              className="text-xs font-black text-emerald-900 hover:text-emerald-950 underline cursor-pointer"
            >
              Clear Search / Show All
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving platform user directory..." />
      ) : displayedUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border-2 border-slate-300 text-center shadow-md">
          <EmptyState
            title="No Users Found"
            description="No user records matched your search query or filters. Clear your search or try another keyword."
          />
          {search && (
            <button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs transition cursor-pointer"
            >
              Show All Users
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b-2 border-slate-300 text-slate-950 uppercase font-black tracking-wider">
                <tr>
                  <th className="py-4 px-6 text-slate-950 font-black">User Name & Email</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Role</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Phone & City</th>
                  <th className="py-4 px-4 text-slate-950 font-black">Account Status</th>
                  <th className="py-4 px-6 text-slate-950 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedUsers.map((u, index) => {
                  const isHighlighted = highlightedUserId === u._id;
                  const isMatch = matchingUserIds.has(u._id) && search.trim().length >= 1;
                  return (
                    <tr
                      key={u._id}
                      className={`transition duration-200 ${
                        isHighlighted
                          ? 'bg-emerald-100 ring-4 ring-emerald-600 font-bold'
                          : isMatch
                          ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600 hover:bg-emerald-100/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {getDisplayName(u)[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="block text-slate-950 font-black text-sm">
                                {renderHighlightedText(getDisplayName(u), search.trim())}
                              </strong>
                              {isMatch && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-950 border border-emerald-500">
                                  {index === 0 ? '⭐ Top Match' : 'Match'}
                                </span>
                              )}
                            </div>
                            <span className="text-xs font-black text-emerald-950 block mt-0.5">
                              {renderHighlightedText(u.email, search.trim())}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${getRoleBadgeStyle(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Phone & City */}
                      <td className="py-4 px-4">
                        <div className="text-slate-950 font-black text-xs">{u.phone || '—'}</div>
                        <div className="text-emerald-950 font-extrabold text-xs mt-0.5">
                          {u.city || '—'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={u.accountStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {u.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            {u.accountStatus === 'active' ? (
                              <button
                                onClick={() => handleStatusChange(u._id, 'suspended')}
                                className="px-3 py-1.5 text-xs font-black rounded-lg text-rose-950 bg-rose-100 hover:bg-rose-200 border border-rose-300 transition shadow-xs cursor-pointer"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(u._id, 'active')}
                                className="px-3 py-1.5 text-xs font-black rounded-lg text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition shadow-xs cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                            {u.role === 'volunteer' && (
                              <button
                                onClick={() => setDeleteTarget(u)}
                                className="px-3 py-1.5 text-xs font-black rounded-lg text-white bg-rose-600 hover:bg-rose-500 border border-rose-700 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                title="Remove volunteer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        title="Remove this volunteer?"
        message={
          deleteTarget
            ? `"${getDisplayName(deleteTarget)}" and their volunteer account will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmText="Remove Volunteer"
        cancelText="Keep Volunteer"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        isLoading={deleting}
      />
    </div>
  );
}
