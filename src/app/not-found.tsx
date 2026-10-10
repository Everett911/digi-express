import MainLayout from "./(main)/layout";
import NotFound from "./(main)/not-found";

// URLs that match no route render here, outside the (main) group, so wrap
// the page in the store layout to keep the header.
export default function RootNotFound() {
  return (
    <MainLayout>
      <NotFound />
    </MainLayout>
  );
}
