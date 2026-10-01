'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Order, OrderItem } from '@/types';

interface InvoicePrintButtonProps {
  order: Order;
  items: OrderItem[];
}

export default function InvoicePrintButton({ order, items }: InvoicePrintButtonProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Faktura — ${order.order_number} — RUN Clothing</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #111;
              margin: 40px;
              line-height: 1.5;
              font-size: 13px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: 900;
              letter-spacing: -1px;
            }
            .title {
              font-size: 20px;
              font-weight: 800;
              text-align: right;
            }
            .parties {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .party-box {
              width: 45%;
            }
            .party-box h4 {
              margin: 0 0 8px 0;
              font-size: 11px;
              text-transform: uppercase;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              border-bottom: 1px solid #000;
              text-align: left;
              padding: 8px 4px;
              font-size: 11px;
              text-transform: uppercase;
            }
            td {
              padding: 10px 4px;
              border-bottom: 1px solid #eee;
            }
            .text-right {
              text-align: right;
            }
            .summary {
              margin-left: auto;
              width: 300px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }
            .summary-total {
              border-top: 2px solid #000;
              font-size: 16px;
              font-weight: 900;
              padding-top: 8px;
              margin-top: 8px;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
              font-size: 11px;
              color: #777;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">RUN</div>
              <div style="font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px;">
                MORE THAN CLOTHES. IT'S A MINDSET.
              </div>
            </div>
            <div>
              <div class="title">FAKTURA — DAŇOVÝ DOKLAD</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: bold; text-align: right;">
                Číslo: ${order.order_number}
              </div>
              <div style="font-size: 11px; color: #555; text-align: right;">
                Datum vystavení: ${new Date(order.created_at || Date.now()).toLocaleDateString('cs-CZ')}
              </div>
            </div>
          </div>

          <div class="parties">
            <div class="party-box">
              <h4>DODAVATEL:</h4>
              <strong>RUN CLOTHING</strong><br />
              Internetový obchod značky RUN<br />
              Účet: 2100894562/2010 (Fio banka a.s.)<br />
              E-mail: info@runclothing.com
            </div>

            <div class="party-box">
              <h4>ODBĚRATEL:</h4>
              <strong>${order.customer_name}</strong><br />
              ${order.billing_street || order.shipping_street}<br />
              ${order.billing_zip || order.shipping_zip} ${order.billing_city || order.shipping_city}<br />
              ${order.billing_country || order.shipping_country}<br />
              E-mail: ${order.customer_email}<br />
              Tel: ${order.customer_phone}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Položka</th>
                <th>Velikost / Barva</th>
                <th class="text-right">Množství</th>
                <th class="text-right">Cena bez DPH</th>
                <th class="text-right">DPH 21%</th>
                <th class="text-right">Celkem s DPH</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((item) => {
                  const unitWithVat = item.price;
                  const unitWithoutVat = Math.round((unitWithVat / 1.21) * 100) / 100;
                  const vatAmount = Math.round((unitWithVat - unitWithoutVat) * 100) / 100;
                  return `
                  <tr>
                    <td><strong>${item.product_name}</strong></td>
                    <td style="font-family: monospace;">${item.size} / ${item.color}</td>
                    <td class="text-right">${item.quantity} ks</td>
                    <td class="text-right">${(unitWithoutVat * item.quantity).toFixed(2)} Kč</td>
                    <td class="text-right">${(vatAmount * item.quantity).toFixed(2)} Kč</td>
                    <td class="text-right"><strong>${item.total.toLocaleString('cs-CZ')} Kč</strong></td>
                  </tr>
                `;
                })
                .join('')}
              ${
                order.shipping_price > 0
                  ? `
                <tr>
                  <td>Doprava: ${order.delivery_method}</td>
                  <td>-</td>
                  <td class="text-right">1</td>
                  <td class="text-right">${(order.shipping_price / 1.21).toFixed(2)} Kč</td>
                  <td class="text-right">${(order.shipping_price - order.shipping_price / 1.21).toFixed(2)} Kč</td>
                  <td class="text-right"><strong>${order.shipping_price} Kč</strong></td>
                </tr>
              `
                  : ''
              }
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Základ daně (21%):</span>
              <span>${Math.round(order.total / 1.21).toLocaleString('cs-CZ')} Kč</span>
            </div>
            <div class="summary-row">
              <span>DPH 21%:</span>
              <span>${Math.round(order.total - order.total / 1.21).toLocaleString('cs-CZ')} Kč</span>
            </div>
            ${
              order.discount_amount > 0
                ? `
              <div class="summary-row" style="color: green;">
                <span>Sleva (${order.discount_code}):</span>
                <span>-${order.discount_amount.toLocaleString('cs-CZ')} Kč</span>
              </div>
            `
                : ''
            }
            <div class="summary-row summary-total">
              <span>CELKEM K ÚHRADĚ:</span>
              <span>${order.total.toLocaleString('cs-CZ')} Kč</span>
            </div>
            <div style="font-size: 11px; color: #555; text-align: right; margin-top: 4px;">
              Způsob platby: ${order.payment_method} (${order.payment_status})
            </div>
          </div>

          <div class="footer">
            RUN Clothing — Oficiální daňový doklad. Vygenerováno systémem RUN Commerce.<br />
            Děkujeme, že jste součástí hnutí RUN.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow"
    >
      <Download className="w-4 h-4" />
      <span>Stáhnout / Tisknout fakturu</span>
    </button>
  );
}
