import { daysAgo } from "../format";
import type {
  DemoCommission,
  DemoOrder,
  DemoPayment,
  DemoWithdrawal,
} from "../types";
import { orderTotal } from "./orders";

export const COMMISSION_RATE = 10;
export const MINIMUM_WITHDRAWAL = 1000;

/** What Stuqet has paid out to the shop. */
export function buildPayments(now: Date): DemoPayment[] {
  const rows: [number, number, string][] = [
    [2, 40000, "Bank payment TRX ID:88213"],
    [18, 25500, "Bank payment TRX ID:77120"],
    [32, 18200, "Bank payment TRX ID:66004"],
    [47, 31000, "Bank payment TRX ID:61350"],
    [61, 12800, "Bank payment TRX ID:58877"],
    [75, 22400, "Bank payment TRX ID:52104"],
    [90, 9600, "Bank payment TRX ID:49310"],
    [104, 15750, "Bank payment TRX ID:44120"],
    [118, 28000, "Bank payment TRX ID:40087"],
    [133, 6400, "Bank payment TRX ID:36650"],
    [147, 19300, "Bank payment TRX ID:31002"],
    [160, 11100, "Bank payment TRX ID:27431"],
  ];
  return rows.map(([days, amount, method], index) => ({
    id: 3000 + index + 1,
    amount,
    method,
    at: daysAgo(now, days),
  }));
}

export function buildWithdrawals(now: Date): DemoWithdrawal[] {
  const rows: [number, number, DemoWithdrawal["status"]][] = [
    [1, 20000, "Pending"],
    [18, 25500, "Paid"],
    [32, 18200, "Paid"],
    [47, 31000, "Paid"],
    [61, 12800, "Paid"],
    [75, 22400, "Paid"],
    [90, 9600, "Paid"],
    [104, 15750, "Paid"],
    [118, 28000, "Paid"],
    [133, 6400, "Paid"],
    [147, 19300, "Paid"],
  ];
  return rows.map(([days, amount, status], index) => ({
    id: 2000 + index + 1,
    amount,
    status,
    at: daysAgo(now, days),
  }));
}

/** Commission rows for every paid, delivered order (newest first). */
export function buildCommissions(orders: DemoOrder[]): DemoCommission[] {
  return orders
    .filter(
      (o) => o.deliveryStatus === "delivered" && o.paymentStatus === "paid",
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((order, index) => {
      const total = orderTotal(order);
      const commission = Math.round((total * COMMISSION_RATE) / 100);
      return {
        id: 4000 + index + 1,
        orderCode: order.code,
        commission,
        earning: total - commission,
        at: order.createdAt,
      };
    });
}
