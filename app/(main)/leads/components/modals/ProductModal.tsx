import { ProductModal as SharedProductModal } from '@/components/shared/modals/ProductModal';
import { useLeadStore } from '@/context/store/leadsStore';

export default function ProductModal() {
  const { selectedProducts, addProduct, removeProduct, productList, leadUUID } = useLeadStore();

  return (
    <SharedProductModal
      selectedProducts={selectedProducts}
      addProduct={addProduct}
      removeProduct={removeProduct}
      availableProducts={productList}
      showReasonModal={false}
      leadUUID={leadUUID}
    />
  );
}
