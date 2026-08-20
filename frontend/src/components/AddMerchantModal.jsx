import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { api } from '../services/api';

export default function AddMerchantModal({ isOpen, onClose, onMerchantAdded }) {
  const [merchantId, setMerchantId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [claimedMcc, setClaimedMcc] = useState('5977 - Cosmetic Stores & Skincare');
  const [registeredCategory, setRegisteredCategory] = useState('Organic Skincare & Herbal Soaps');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('1500000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const generatedId = merchantId || `mid_${merchantName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}_${Math.floor(Math.random()*1000)}`;
      await api.addMerchant({
        merchant_id: generatedId,
        merchant_name: merchantName,
        claimed_mcc: claimedMcc,
        registered_category: registeredCategory,
        website_url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
        monthly_volume_inr: parseFloat(monthlyVolume) || 500000.0
      });
      onMerchantAdded();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to register merchant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl custom-glass border border-slate-800 p-6 space-y-5 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5 text-sky-400" /> REGISTER NEW ONLINE STORE
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Add an online store entity to Trace's persistent database to monitor against cloaking and fraud.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <Icon icon="solar:shield-warning-bold-duotone" className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Store / Business Name</label>
              <div className="relative">
                <Icon icon="solar:shop-2-bold-duotone" className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Pure Herbals Organics"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Store Website URL</label>
              <div className="relative">
                <Icon icon="solar:global-bold-duotone" className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="https://pureherbals.in"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Claimed Merchant Category (MCC)</label>
            <div className="relative">
              <Icon icon="solar:tag-bold-duotone" className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={claimedMcc}
                onChange={(e) => setClaimedMcc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="5977 - Cosmetic Stores & Skincare">5977 - Cosmetic Stores &amp; Skincare</option>
                <option value="5949 - Sewing, Needlework & Fabric">5949 - Sewing, Needlework &amp; Fabric</option>
                <option value="5814 - Fast Food Restaurants">5814 - Fast Food Restaurants</option>
                <option value="5734 - Computer Software Stores">5734 - Computer Software Stores</option>
                <option value="7995 - Gambling & Casino Chips (Prohibited)">7995 - Gambling &amp; Casino Chips (Prohibited)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Registered Business Line / Catalog</label>
            <input
              type="text"
              placeholder="e.g. Organic Skincare & Neem Soaps"
              value={registeredCategory}
              onChange={(e) => setRegisteredCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
            >
              {isSubmitting ? 'Registering...' : 'Save & Register Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
