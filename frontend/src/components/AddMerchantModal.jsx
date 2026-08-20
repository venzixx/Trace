import React, { useState } from 'react';
import { PlusCircle, X, Store, Globe, DollarSign, Tag, CheckCircle, AlertCircle } from 'lucide-react';
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
      <div className="w-full max-w-lg rounded-2xl custom-glass border border-cyber-border p-6 space-y-5 relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-400" /> REGISTER NEW MONITORED MERCHANT
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Add a real merchant entity to Trace's persistent database to monitor against cloaking and bust-outs.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Legal Merchant Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Saffron Organics Retail Pvt Ltd"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Merchant ID (Optional)</label>
              <input
                type="text"
                placeholder="mid_saffron_99"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Estimated Monthly Vol (₹)</label>
              <input
                type="number"
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Claimed Storefront URL</label>
            <input
              type="text"
              required
              placeholder="https://saffron-organics.in"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Declared MCC Code</label>
              <select
                value={claimedMcc}
                onChange={(e) => setClaimedMcc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              >
                <option value="5977 - Cosmetic Stores & Skincare">5977 - Cosmetics &amp; Skincare</option>
                <option value="5949 - Sewing & Needlework Stores">5949 - Textiles &amp; Crafts</option>
                <option value="5732 - Electronic Sales & Stores">5732 - Consumer Electronics</option>
                <option value="5814 - Fast Food Restaurants">5814 - Food &amp; Beverage</option>
                <option value="7995 - Gambling & Betting">7995 - Gaming &amp; Betting</option>
                <option value="5311 - Department Stores">5311 - Department Store</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Business Category</label>
              <input
                type="text"
                value={registeredCategory}
                onChange={(e) => setRegisteredCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'SAVING TO DATABASE...' : 'SAVE TO DATABASE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
