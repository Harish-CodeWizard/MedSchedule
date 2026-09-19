import { Bike, MapPin, Store } from 'lucide-react';

function FulfillmentOptions({ value, onChange, address, onAddressChange }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">How would you like to receive your medicine?</p>
        <p className="mt-1 text-xs text-slate-500">Choose before payment so the pharmacy can prepare it.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onChange('takeaway')} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${value === 'takeaway' ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>
          <Store className="size-5" />
          <span><b className="block text-sm">Takeaway</b><small className="text-xs opacity-70">Collect from pharmacy</small></span>
        </button>
        <button type="button" onClick={() => onChange('delivery')} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${value === 'delivery' ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-100' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>
          <Bike className="size-5" />
          <span><b className="block text-sm">Delivery</b><small className="text-xs opacity-70">Bring it to your address</small></span>
        </button>
      </div>
      {value === 'delivery' && (
        <label className="block text-sm font-medium text-slate-700">
          Delivery address
          <div className="relative mt-2">
            <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <textarea value={address} onChange={(event) => onAddressChange(event.target.value)} required rows="2" placeholder="Enter your delivery address" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-9 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>
        </label>
      )}
    </div>
  );
}

export default FulfillmentOptions;
