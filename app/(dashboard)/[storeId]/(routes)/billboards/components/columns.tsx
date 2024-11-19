'use client';

import { ColumnDef } from '@tanstack/react-table';

import { CellAction } from './cell-action';

export type BillboardColumn = {
  id: string;
  label: string;
  labelEn: string; // Add the new field here
  createdAt: string;
  isBillboardActive: boolean;
};

// Updated columns definition to reflect the new data structure
export const columns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: 'label',
    header: 'Label',
  },
  {
    accessorKey: 'labelEn', // Adding labelEn to the columns
    header: 'Label (EN)', // Adjust the title as needed
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
  },
  {
    accessorKey: 'isBillboardActive',
    header: 'Active',
    cell: ({ row }) => (row.getValue('isBillboardActive') ? 'Yes' : 'No'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
