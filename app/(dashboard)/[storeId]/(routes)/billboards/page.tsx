import { format } from 'date-fns';

import prismadb from '@/lib/prismadb';

import { BillboardClient } from './components/client';
import { BillboardColumn } from './components/columns';

const BillboardsPage = async ({
  params,
}: {
  params: {
    storeId: string;
  };
}) => {
  // Fetch billboards, including the new labelEn field
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Map over billboards to format the data, including labelEn
  const formattedBillboards: BillboardColumn[] = billboards.map((billboard) => ({
    id: billboard.id,
    label: billboard.label,
    labelEn: billboard.labelEn, // Add the new field
    createdAt: format(billboard.createdAt, 'MMMM do, yyyy'),
    isBillboardActive: billboard.isBillboardActive, // Include the new field
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;
