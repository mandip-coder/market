"use client";

import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Input from "@/components/Input/Input";
import Label from "@/components/Label/Label";
import { useProductStore } from "@/context/store/productStore";
import { useTherapeuticAreas } from "@/services/dropdowns/dropdowns.hooks";
import { Button, Drawer, Tooltip } from "antd";
import { Form, Formik, FormikHelpers } from "formik";
import { Info, Save } from "lucide-react";
import * as Yup from "yup";
import { useCreateProduct, useUpdateProduct } from "./services/products.hooks";

interface ProductFormValues {
  productName: string;
  therapeuticAreaUUID: string;
  partCode: string[];
  BNFCode: string[];
}

const validationSchema = Yup.object().shape({
  productName: Yup.string().required("Product Name is required"),
  therapeuticAreaUUID: Yup.string().required("Therapeutic Area is required"),
  partCode: Yup.array()
    .of(Yup.string())
    .min(1, "At least one Part Code is required")
    .required("Part Code is required"),
  BNFCode: Yup.array().of(Yup.string()).nullable(),
});
export default function AddProductDrawer() {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { editProduct, setEditProduct, toggleProductDrawer, addProductDrawer } =
    useProductStore();
  const { data: therapeuticAreas = [], isLoading } = useTherapeuticAreas({
    enabled: addProductDrawer,
  });

  const isEditMode = !!editProduct;
  const productData = editProduct || null;

  const handleClose = () => {
    setEditProduct(null);
    toggleProductDrawer();
  };

  const handleSubmit = async (
    values: ProductFormValues,
    { resetForm, setSubmitting, setTouched }: FormikHelpers<ProductFormValues>
  ) => {
      const submitData = {
        productName: values.productName,
        partCode: values.partCode,
        BNFCode: values.BNFCode,
        therapeuticAreaUUID: values.therapeuticAreaUUID,
      };

      if (isEditMode && productData?.productUUID) {
        // Update existing product
        await updateProduct.mutateAsync(
          {
            productUUID: productData.productUUID,
            ...submitData,
          },
          {
            onSuccess: () => {
              resetForm();
              handleClose();
            },
          }
        );
      } else {
        await createProduct.mutateAsync(submitData, {
          onSuccess: () => {
            resetForm();
            handleClose();
          },
        });
      }
    
      setSubmitting(false);
    
  };

  const getProductValues = (): ProductFormValues => {
    if (isEditMode && productData) {
      return {
        ...productData,
      };
    }
    return {
      productName: "",
      therapeuticAreaUUID: "",
      partCode: [],
      BNFCode: [],
    };
  };

  return (
    <Drawer
      title={
        isEditMode
          ? "Edit Product " + productData?.productName
          : "Add New Product"
      }
      footer={
        <div className="flex justify-end space-x-2 pt-4">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            form="productForm"
            loading={createProduct.isPending || updateProduct.isPending}
            icon={<Save className="h-4 w-4" />}
          >
            {isEditMode ? "Update" : "Create"} Product
          </Button>
        </div>
      }
      onClose={handleClose}
      open={addProductDrawer}
      size={"large"}
      destroyOnHidden
    >
      <Formik
        initialValues={getProductValues()}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        <Form id="productForm">
          <div className="space-y-4">
            <Input
              name="productName"
              label="Product Name"
              required
              placeholder="Enter product name"
            />

            <CustomSelect
              name="therapeuticAreaUUID"
              label="Therapeutic Area"
              placeholder="Select therapeutic area"
              loading={isLoading}
              options={therapeuticAreas.map((area) => ({
                label: area.therapeuticArea,
                value: area.therapeuticAreaUUID,
              }))}
              required
            />

            <CustomSelect
              name="partCode"
              label="Part Code"
              placeholder="Type and press Enter to add"
              mode="tags"
              required
            />

            <div className="relative w-full">
              <div className="flex items-center gap-1 mb-1">
                <Label htmlFor="BNFCode" text="Other|BNFCode" />
                <Tooltip
                  title="For UK: BNF code will be used. For other countries, you can use other codes if applicable."
                  placement="top"
                >
                  <Info className="h-3 w-3 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <CustomSelect
                name="BNFCode"
                placeholder="Type and press Enter to add"
                mode="tags"
              />
            </div>
          </div>
        </Form>
      </Formik>
    </Drawer>
  );
}
