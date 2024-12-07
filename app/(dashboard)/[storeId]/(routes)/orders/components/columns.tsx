'use client';

import { ColumnDef } from '@tanstack/react-table';

import { StatusCell } from './StatusCell'; // Import StatusCell component

export type OrderColumn = {
  storeId: string;
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string; // Keep the formatted string version
  productDetails: { name: string; quantity: number }[]; // Add the detailed array
  createdAt: string;
  status: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: 'products',
    header: 'Products',
    cell: ({ row }) => {
      const products = row.getValue('productDetails') as { name: string; quantity: number }[]; 
      return products
        .map(product => `${product.name} (x${product.quantity})`) // Format with quantity
        .join(', '); // Join multiple products with a comma
    },
  },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'address', header: 'Address' },
  { accessorKey: 'totalPrice', header: 'Total Price' },
  {
    accessorKey: 'isPaid',
    header: 'Paid',
    cell: ({ row }) => (row.getValue('isPaid') ? 'Yes' : 'No'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusCell
        initialStatus={row.getValue('status')}
        storeId={row.original.storeId}
        orderId={row.original.id} // Use row.original to access 'id'
      />
    ),
  },
  { accessorKey: 'createdAt', header: 'Created At' },
];
