import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Dashboard.css";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    totalPayments: 0,
    outstandingInvoices: 0,
    overdueInvoices: 0,
  });
  async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    setError(error.message || "Unable to sign out.");
  }
}

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [subscriptionsRes, invoicesRes, paymentsRes] =
        await Promise.all([
          supabase
            .from("subscriptions")
            .select("id", { count: "exact", head: true })
            .ilike("status", "active"),

          supabase
            .from("invoices")
            .select("id, total_amount, due_date, status"),

          supabase
            .from("payments")
            .select("id, invoice_id, amount, payment_method, payment_date")
            .order("payment_date", { ascending: false })
            .limit(5),
        ]);

      const queryError =
        subscriptionsRes.error ||
        invoicesRes.error ||
        paymentsRes.error;

      if (queryError) throw queryError;

      const invoices = invoicesRes.data ?? [];
      const paymentRows = paymentsRes.data ?? [];

      const totalPayments = paymentRows.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      );

      const unpaidInvoices = invoices.filter(
        (invoice) => invoice.status?.toLowerCase() !== "paid"
      );

      const outstandingInvoices = unpaidInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.total_amount || 0),
        0
      );

      const today = new Date().toISOString().slice(0, 10);

      const overdueInvoices = unpaidInvoices.filter(
        (invoice) => invoice.due_date && invoice.due_date < today
      ).length;

      setStats({
        activeSubscriptions: subscriptionsRes.count ?? 0,
        totalPayments,
        outstandingInvoices,
        overdueInvoices,
      });

      setPayments(paymentRows);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <main className="dashboard"><p>Loading dashboard...</p></main>;
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">SUBSCRIPTION MANAGEMENT SYSTEM</p>
          <h1>Dashboard</h1>
          <p className="subtitle">Monitor your subscription business.</p>
        </div>

        <div className="dashboard-actions">
  <button className="refresh-button" onClick={loadDashboard}>
    Refresh data
  </button>

  <button className="logout-button" onClick={handleLogout}>
   logout 
  </button>
</div>
      </header>

      {error && (
        <div className="error-message">
          <strong>Unable to load dashboard data</strong>
          <p>{error}</p>
          <p>Check your Supabase connection and table permissions.</p>
        </div>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Active subscriptions</span>
          <strong>{stats.activeSubscriptions}</strong>
          <small>Currently marked active</small>
        </article>

        <article className="stat-card">
          <span>Payments recorded</span>
          <strong>{currency(stats.totalPayments)}</strong>
          <small>Sum of the latest five payments</small>
        </article>

        <article className="stat-card">
          <span>Outstanding invoices</span>
          <strong>{currency(stats.outstandingInvoices)}</strong>
          <small>Full totals of unpaid invoices</small>
        </article>

        <article className="stat-card">
          <span>Overdue invoices</span>
          <strong>{stats.overdueInvoices}</strong>
          <small>Unpaid invoices past their due date</small>
        </article>
      </section>

      <section className="panel">
        <h2>Recent payments</h2>
        <p className="subtitle">Latest five payment records</p>

        {payments.length === 0 ? (
          <p className="empty-state">No payments found yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice ID</th>
                  <th>Payment method</th>
                  <th className="amount-column">Amount</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>{payment.invoice_id ?? "—"}</td>
                    <td>{payment.payment_method ?? "—"}</td>
                    <td className="amount-column">
                      {currency(payment.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}