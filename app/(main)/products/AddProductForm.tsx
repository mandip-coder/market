"use client";

import { Button, Drawer } from "antd";
import TextArea from "antd/es/input/TextArea";
import { toast } from "@/components/AppToaster/AppToaster";
import { Product, useProductStore } from "@/context/store/productStore";
import { useApi } from "@/hooks/useAPI";
import { useLoading } from "@/hooks/useLoading";
import { APIPATH } from "@/shared/constants/url";
import { Save } from "lucide-react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import Input from "@/components/Input/Input";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import Label from "@/components/Label/Label";

const THERAPEUTIC_AREAS = [
  "Cardiology",
  "Oncology",
  "Diabetes",
  "Respiratory",
  "Neurology",
];

interface ProductFormValues extends Partial<Product> { }

const validationSchema = Yup.object().shape({

});

export default function AddProductForm() {
  const API = useApi();
  const [loading, setLoading] = useLoading();
  const {
    editProduct,
    setTableDataState,
    setEditProduct,
    toggleProductDrawer,
    addProductDrawer,
  } = useProductStore();
  const isEditMode = !!editProduct;
  const productData = editProduct || null;

  const handleClose = () => {
    setEditProduct(null);
    toggleProductDrawer();
  };

  const handleSubmit = async (values: ProductFormValues, { resetForm, setSubmitting }: FormikHelpers<ProductFormValues>) => {
    setLoading(true);

    if (isEditMode && productData?.productUUID) {
      const res = await API.put(
        `${APIPATH.PRODUCTS.UPDATEPRODUCT}${productData.productUUID}`,
        values
      );
      if (res) {
        setTableDataState((prevData) =>
          prevData.map((p) =>
            p.productUUID === productData.productUUID
              ? { ...p, ...res.data }
              : p
          )
        );
        toast.success("Product updated successfully!");
        resetForm();
        handleClose();
      }
    } else {
      const res = await API.post(
        APIPATH.PRODUCTS.CREATEPRODUCT,
        values
      );
      if (res) {
        setTableDataState((prevData) => [...prevData, res.data]);
        resetForm();
        handleClose();
        toast.success("Product created successfully!");
      }
    }
    setSubmitting(false);


  };
  const getProductValues = (): ProductFormValues => {
    if (isEditMode && productData) {
      return {
        ...productData
      };
    }
    return {
      productCode: "",
      productName: "",
      genericName: "",
      therapeuticArea: "",
    };
  };

  return (
    <Drawer
      title="Add New Product"
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
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
        }) => (
          <Form>
            <div className="space-y-4">
              <Input
                name="productCode"
                label="Product Code"
                required
                placeholder="P-001"
              />

              <Input
                name="productName"
                label="Product Name"
                required
                placeholder="Product Name"
              />

              <CustomSelect
                name="therapeuticArea"
                label="Therapeutic Area"
                placeholder="Select area"
                options={THERAPEUTIC_AREAS.map((area) => ({
                  label: area,
                  value: area,
                }))}
                required
              />

              <Input
                name="sourceErpId"
                label="Source ERP ID"
                placeholder="ERP-12345"
                required
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || isSubmitting}
                  icon={<Save className="h-4 w-4" />}
                >
                  {isEditMode ? "Update" : "Create"} Product
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Drawer>
  );
}
