import { Bike, CheckCircle, Clock3, Store } from 'lucide-react';

const STATUS_LABELS = {
  awaiting_payment: 'Awaiting payment',
  ready_for_takeaway: 'Ready for takeaway',
  preparing_delivery: 'Preparing delivery',
  out_for_delivery: 'Out for delivery',
  fulfilled: 'Fulfilled',
};

function FulfillmentStatus({ method, status }) {
  if (!method && !status) return null;

  const isDelivery = method === 'delivery';
  const Icon = status === 'fulfilled' ? CheckCircle : isDelivery ? Bike : Store;
  const label = STATUS_LABELS[status] || (isDelivery ? 'Delivery selected' : 'Takeaway selected');
  const color = status === 'fulfilled'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-blue-100 text-blue-800';

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${color}`}>
      <Icon className="size-4" />
      <span>{label}</span>
      {status === 'ready_for_takeaway' && <Clock3 className="ml-auto size-4" aria-label="Prepared" />}
    </div>
  );
}

export default FulfillmentStatus;
