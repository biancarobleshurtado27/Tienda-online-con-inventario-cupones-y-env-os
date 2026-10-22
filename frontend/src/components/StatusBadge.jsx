import React from 'react';
import { Clock, CheckCircle2, Truck, PackageCheck, XCircle } from 'lucide-react';

export default function StatusBadge({ estado }) {
  const config = {
    nueva: {
      label: 'Nueva',
      className: 'badge-nueva',
      icon: Clock,
    },
    pagada: {
      label: 'Pagada',
      className: 'badge-pagada',
      icon: CheckCircle2,
    },
    enviada: {
      label: 'Enviada',
      className: 'badge-enviada',
      icon: Truck,
    },
    entregada: {
      label: 'Entregada',
      className: 'badge-entregada',
      icon: PackageCheck,
    },
    cancelada: {
      label: 'Cancelada',
      className: 'badge-cancelada',
      icon: XCircle,
    },
  };

  const current = config[estado] || {
    label: estado,
    className: 'badge-nueva',
    icon: Clock,
  };

  const Icon = current.icon;

  return (
    <span className={`badge ${current.className}`}>
      <Icon size={12} />
      <span>{current.label}</span>
    </span>
  );
}
