import { getAdminOrders } from "../actions/order-actions";
import { OrderManager } from "../components/order-manager";

type Props = {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  };
};

export async function OrderPage({ searchParams }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit === "ALL" ? "ALL" : searchParams.limit ? parseInt(searchParams.limit, 10) : 10;
  const search = searchParams.search || "";
  const status = searchParams.status || undefined;

  const ordersData = await getAdminOrders({
    page,
    pageSize: limit,
    search,
    status,
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-8">
      <OrderManager 
        initialOrders={ordersData.orders} 
        totalOrders={ordersData.total}
        currentPage={page}
        currentLimit={limit}
        currentSearch={search}
        currentStatus={status}
      />
    </div>
  );
}
