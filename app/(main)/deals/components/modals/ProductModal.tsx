import { ProductModal as SharedProductModal } from '@/components/shared/modals/ProductModal';
import { useDealStore } from '@/context/store/dealsStore';

export default function ProductModal() {
  const { selectedProducts, addProduct, removeProduct, dealStage, productList, dealUUID } = useDealStore();
  return (
    <SharedProductModal
      selectedProducts={selectedProducts}
      addProduct={addProduct}
      removeProduct={removeProduct}
      availableProducts={productList}
      stage={dealStage}
      showReasonModal={true}
      dealUUID={dealUUID}
    />
  );
}
