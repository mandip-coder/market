import AppErrorUI from "@/components/AppErrorUI/AppErrorUI";
import ProductDetailsTabs from "./ProductDetails";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id.length !== 36) {
    return (
      <AppErrorUI
        code={400}
        message={"Invalid Page Request"}
        backLink="/products"
        buttonName="Back to Products"
      />
    );
  }
  return <ProductDetailsTabs id={id} />;
}
