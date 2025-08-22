const Order = require('../models/Order');

// Ensure payment_transactions table exists (idempotent DDL)
async function ensurePaymentTransactionsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      orderId INT NOT NULL,
      provider VARCHAR(50) NOT NULL,
      type VARCHAR(30) NOT NULL,               -- PAYMENT | REFUND
      status VARCHAR(30) NOT NULL,             -- SUCCESS | FAILED | PENDING
      amount DECIMAL(15,2) DEFAULT NULL,
      reference VARCHAR(255) DEFAULT NULL,     -- gateway transaction id / code
      bankCode VARCHAR(50) DEFAULT NULL,
      raw TEXT DEFAULT NULL,                   -- raw gateway payload (JSON string)
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await Order.sequelize.query(sql);
}

async function logPaymentTransaction({ orderId, provider, type, status, amount, reference, bankCode, raw }) {
  try {
    await ensurePaymentTransactionsTable();
    await Order.sequelize.query(
      'INSERT INTO payment_transactions (orderId, provider, type, status, amount, reference, bankCode, raw) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [orderId, provider, type, status, amount ?? null, reference ?? null, bankCode ?? null, raw ? JSON.stringify(raw) : null],
        type: Order.sequelize.QueryTypes.INSERT
      }
    );
  } catch (e) {
    console.error('Failed to log payment transaction:', e.message);
  }
}

// Basic refund requester (simulate by default unless real integration is added)
async function requestRefund({ orderId, provider, amount, reason }) {
  // If simulate mode enabled (default), return SUCCESS
  const simulateMode = (process.env.PAYMENT_REFUND_MODE || 'simulate').toLowerCase() === 'simulate';
  if (simulateMode) {
    const reference = `SIM-${Date.now()}`;
    await logPaymentTransaction({
      orderId,
      provider,
      type: 'REFUND',
      status: 'SUCCESS',
      amount,
      reference,
      raw: { reason, mode: 'simulate' }
    });
    return { success: true, reference, message: 'Simulated refund success' };
  }

  // TODO: Implement real refund calls per provider (VNPay/ZaloPay/MoMo) when credentials and APIs are ready
  // For now, mark as FAILED in non-simulate mode to avoid pretending.
  await logPaymentTransaction({
    orderId,
    provider,
    type: 'REFUND',
    status: 'FAILED',
    amount,
    reference: null,
    raw: { reason, mode: 'not_implemented' }
  });
  return { success: false, reference: null, message: 'Refund not implemented for this provider' };
}

module.exports = {
  logPaymentTransaction,
  requestRefund,
};
