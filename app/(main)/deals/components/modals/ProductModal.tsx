import { ProductModal as SharedProductModal } from '@/components/shared/modals/ProductModal';
import { useAddDealProduct, useDeleteDealProduct } from '../../services/deals.hooks';
import { Deal } from '../../services/deals.types';
import { Product } from '@/app/(main)/products/services/types';

export default function ProductModal({ deal, selectedProducts, refetching, refetch }: { deal: Deal; selectedProducts: Product[]; refetching: boolean; refetch: () => void }) {
  // React Query hooks
  const addProductMutation = useAddDealProduct(deal.dealUUID);
  const deleteProductMutation = useDeleteDealProduct(deal.dealUUID);


  return (
    <SharedProductModal
      selectedProducts={selectedProducts}
      addProductMutation={addProductMutation}
      deleteProductMutation={deleteProductMutation}
      stage={deal.dealStage}
      showReasonModal={true}
      dealUUID={deal.dealUUID}
      refetching={refetching}
      refetch={refetch}
    />
  );
}
