export const formatReceiptTable = (order, currency) => {
  const { taxationAmount: tax, orderAmount, deliveryCharges, createdAt } = order

  const user = order?.user || null
  const restaurant = order?.restaurant || null
  const name = restaurant?.name || null
  const currencySymbol = currency

  const itemsRow = order?.items
    ?.map(item => {
      const addonsArray =
        item.addons?.flatMap(addon =>
          addon.options?.map(opt => `${opt.title} +${opt.price}`)
        ) || []

      const addonsText = addonsArray.join('، ') // comma-separated

      const unitPrice =
        item.variation.price +
        item.addons
          .flatMap(addon => addon.options)
          .reduce((sum, option) => sum + option.price, 0)

      const totalPrice = unitPrice * item.quantity

      return `
        <tr>
          <td style="width: 12%; text-align: center;">${item.quantity}</td>
          <td style="width: 34%; font-weight: bold;">
            ${item.title} ${
        item.variation?.title ? `(${item.variation.title})` : ''
      }
          </td>
          <td style="width: 28%; font-size: 11px;">
            ${addonsText || '-'}
          </td>
          <td style="width: 26%; font-size: 11px; white-space: nowrap;">
            ${unitPrice.toFixed(2)} × ${item.quantity} = ${totalPrice.toFixed(
        2
      )}
          </td>
        </tr>

        ${
          item.specialInstructions
            ? `<tr>
                <td colspan="4" style="padding: 4px 0; font-size: 11px;">
                  <div style="border: 1px dashed #000; padding: 4px;">
                    <strong>ملاحظات:</strong> ${item.specialInstructions}
                  </div>
                </td>
              </tr>`
            : ''
        }
      `
    })
    .join('')

  const date = new Date(createdAt)
  const formatter = new Intl.DateTimeFormat('ar-EG', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
  const formattedDate = formatter.format(date)

  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        * { text-align: right; }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #000;
          margin: 0;
          padding: 0;
          direction: rtl;
        }
        #receipt {
          max-width: 227px;
          margin: 0 auto;
          padding: 6px;
          background: #fff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
        }
        table td, table th {
          border-bottom: 1px dashed #000;
          padding: 3px 2px;
        }
        .line {
          border-top: 2px dashed #000;
          margin: 6px 0;
        }
        .footer {
          margin-top: 6px;
          font-size: 11px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="receipt">
        <div style="background-color: #000; padding: 14px; width: 100%;">
          <div style="text-align: center; font-size: 18px; font-weight: bold; color: #fff;">Orderat - أوردرات</div>
          <div style="text-align: center; font-size: 16px; font-weight: bold; color: #fff;">${
            order?.orderId
          }</div>
        </div>

        <div style="text-align: center; font-size: 15px; font-weight: bold; margin-top: 5px;">${name}</div>
        <div style="text-align: center; font-size: 13px; margin-bottom: 5px;">تاريخ الطلب: ${formattedDate}</div>

        <div class="line"></div>

        <div style="text-align: right;"><strong>العميل:</strong> ${
          user?.name || 'لا يوجد اسم'
        }</div>
        <div style="text-align: right;"><strong>الهاتف:</strong> ${
          user ? user?.phone?.replace('+2', '') : 'N/A'
        }</div>

        <div class="line"></div>

        <div style="text-align: center; font-size: 14px; font-weight: bold;">تفاصيل الطلب</div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center;">الكمية</th>
              <th>الصنف</th>
              <th>الإضافات</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRow}
          </tbody>
        </table>

        <div class="line"></div>

        <div style="display: flex; justify-content: space-between; flex-direction: row-reverse;">
          <div>الضريبة</div>
          <div>${currency} ${tax?.toFixed(2)}</div>
        </div>

        <div style="display: flex; justify-content: space-between; flex-direction: row-reverse;">
          <div>رسوم التوصيل</div>
          <div>${currency} ${deliveryCharges?.toFixed(2)}</div>
        </div>

        <div style="display: flex; justify-content: space-between; font-weight: bold; flex-direction: row-reverse;">
          <div>الإجمالي</div>
          <div>${currency} ${orderAmount?.toFixed(2)}</div>
        </div>

        <div class="line"></div>

        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>${name}</p>
        </div>
      </div>
    </body>
  </html>
  `
}
