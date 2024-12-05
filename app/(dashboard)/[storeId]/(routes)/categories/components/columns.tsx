'use client';

import { ColumnDef } from '@tanstack/react-table';

import { CellAction } from './cell-action';

// Updated CategoryColumn type to include fieldNameEn for fields
export type CategoryColumn = {
  id: string;
  name: string;
  nameEn: string; // Add nameEn
  categoryDescription: string;
  categoryDescriptionEn: string; // Add categoryDescriptionEn
  billboardLabel: string;
  createdAt: string;
  categoryType: string; // Include categoryType
  fields: { fieldName: string; fieldNameEn: string; fieldType: string; options: string[] }[]; // Fields property updated
};

export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Name', // Updated header to reflect multilingual nature
  },
  {
    accessorKey: 'nameEn',
    header: 'Name (EN)', // Add column for nameEn
  },
  {
    accessorKey: 'billboard',
    header: 'Billboard',
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: 'categoryDescription',
    header: 'Category Description', // Updated header for clarity
  },
  {
    accessorKey: 'categoryDescriptionEn',
    header: 'Category Description (EN)', // Add column for categoryDescriptionEn
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
  },
  {
    accessorKey: 'categoryType', // Add categoryType to display in the table
    header: 'Category Type',
  },
  {
    id: 'fieldsArabic',
    header: 'Fields (Arabic)',
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
    id: 'fieldsEnglish',
    header: 'Fields (English)',
    cell: ({ row }) => (
      <ul>
        {row.original.fields.map((field, index) => (
          <li key={index}>
            <em style={{ color: 'gray', fontSize: '0.9em' }}>{field.fieldNameEn}</em> {/* English Field Name */}
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
