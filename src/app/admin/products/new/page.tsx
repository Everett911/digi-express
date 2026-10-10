import { PageHeader, Panel } from "../../_components/ui";
import { requireAdminPage } from "../../_lib/auth";
import ProductForm from "../_components/ProductForm";
import styles from "../form.module.css";

export default async function NewProductPage() {
  await requireAdminPage();

  return (
    <>
      <PageHeader
        title="Add product"
        description="New products start inactive until you activate them."
      />
      <Panel>
        <div className={styles.formBody}>
          <ProductForm />
        </div>
      </Panel>
    </>
  );
}
