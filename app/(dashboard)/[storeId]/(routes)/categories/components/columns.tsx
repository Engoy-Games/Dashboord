'use client'

import { ColumnDef } from '@tanstack/react-table'

import { CellAction } from './cell-action'

export type CategoryColumn = {
  id: string;
  name: string;
  categoryDescription: string;
  billboardLabel: string;
  createdAt: string;
  fields: { fieldName: string; fieldType: string; options: string[] }[]; // New fields property
}


export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'billboard',
    header: 'Billboard',
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: 'categoryDescription',
    header: 'Category Description',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
  },
  {
    id: 'fields',
    header: 'Fields',
    cell: ({ row }) => (
      <ul>
        {row.original.fields.map((field, index) => (
          <li key={index}>
            {field.fieldName} 
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
