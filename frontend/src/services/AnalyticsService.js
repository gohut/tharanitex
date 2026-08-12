import { OrderRepository } from "../repositories/OrderRepository";
import { ProductRepository } from "../repositories/ProductRepository";
import { UserRepository } from "../repositories/UserRepository";

export class AnalyticsService {
  static async getDashboardStats() {
    const totalRevenue = await OrderRepository.sumRevenue();
    const totalSales = await OrderRepository.countAll();
    const topProducts = await OrderRepository.findTopProducts(5);
    const lowStock = await ProductRepository.findLowStock(5);
    const recentOrders = await OrderRepository.findRecent(5);
    const customerCount = (await UserRepository.findAllCustomers()).length;

    return {
      metrics: {
        total_revenue: totalRevenue,
        total_sales: totalSales,
        total_customers: customerCount,
      },
      top_products: topProducts,
      low_stock: lowStock,
      recent_orders: recentOrders,
    };
  }

  static async getDetailedAnalytics() {
    const topProducts = await OrderRepository.findTopProducts(10);
    const lowStock = await ProductRepository.findLowStock(10);
    const totalRevenue = await OrderRepository.sumRevenue();
    const totalSales = await OrderRepository.countAll();

    return {
      revenue: totalRevenue,
      sales: totalSales,
      top_products: topProducts,
      low_stock: lowStock,
    };
  }
}
