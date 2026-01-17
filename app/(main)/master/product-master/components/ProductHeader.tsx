"use client";
import AddProductForm from "@/app/(main)/products/AddProductDrawer";
import PageHeading from "@/components/PageHeading/PageHeading";
import { useProductStore } from "@/context/store/productStore";
import { Button } from "antd";
import { Plus } from "lucide-react";
import { memo, useMemo } from "react";

function ProductHeader() {
  const toggleProductDrawer = useProductStore((state) => state.toggleProductDrawer);
  const extraContent = useMemo(
    () => (
      <div className="flex gap-3 flex-shrink-0">
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={toggleProductDrawer}
        >
          Add New Product
        </Button>
      </div>
    ),
    [toggleProductDrawer]
  );

  return (
    <>
      <PageHeading
        title="Product Management"
        descriptionLine="Manage products and inventory"
        extra={extraContent}
      />

      <AddProductForm />
    </>
  );
}

export default memo(ProductHeader);
