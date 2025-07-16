//src/utilities/formatReceipt.js
export const formatReceipt = (order, currency) => {
  const address =
    order?.shippingMethod === 'PICKUP'
      ? 'الاستلام من الفرع'
      : `${order?.deliveryAddress?.label} ${order?.deliveryAddress?.details} ${order?.deliveryAddress?.deliveryAddress}`

  const {
    user: { phone },
    restaurant: { name, image },
    taxationAmount: tax,
    orderAmount,
    deliveryCharges,
    createdAt
  } = order

  const currencySymbol = currency

  const itemsRow = order.items
    .map(item => {
      const addons = item.addons
        .map(
          addon =>
            `<div style="font-size: 10px; color: #555;">${
              addon.title
            }: ${addon.options.map(o => o.title).join(', ')}</div>`
        )
        .join('')

      const itemTotal =
        item.variation.price +
        item.addons
          .flatMap(addon => addon.options)
          .reduce((sum, option) => sum + option.price, 0)

      return `
        <div style="border-bottom: 1px dashed #ccc; padding: 5px 0;">
          <div style="font-weight: bold;">
            ${item.title}
          </div>
          <div style="font-weight: bold;">
          ${item.variation.title ? item.variation.title : ''} - ${
        item.variation.price ? item.variation.price + ' ' + currency : ''
      } 
          </div>
          ${addons}
          <div style="display: flex; justify-content: space-between;">
            <span>الكمية: ${item.quantity}</span>
            <span>السعر: ${currencySymbol}${itemTotal.toFixed(2)}</span>
          </div>
          ${
            item.specialInstructions
              ? `<div style="font-size: 11px; border: 1px dashed #000; padding: 15px 25px;">ملاحظة: ${item.specialInstructions}</div>`
              : ''
          }
        </div>
      `
    })
    .join('')

  const date = new Date(createdAt)
  const formatter = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
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
      @page {
        margin-inline: auto !important;
      }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          color: #000;
          margin: 0;
          padding: 0;
          direction: rtl;
          text-align: right;
        }
        #receipt {
          max-width: 227px;
          margin-right: auto;
          margin-left: auto;
          padding: 10px;
          background: #fff;
        }
        .center {
          text-align: center;
        }
        .bold {
          font-weight: bold;
        }
        .line {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 4px 0;
        }
        .footer {
          margin-top: 10px;
          font-size: 11px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div id="receipt">
	  
        <img src="${image}" width="120" height="120" />
		
        <div class="center bold" style="text-align:center; font-size: 22px;">${name}</div>
		
        <div class="center" style="font-size: 16px; margin-bottom: 5px;">تاريخ الطلب: ${formattedDate}</div>

        <div class="line"></div>
        <div><strong>العنوان:</strong> ${address}</div>
        <div><strong>الهاتف:</strong> ${phone}</div>
        <div class="line"></div>

        <div class="bold" style="margin-bottom: 6px;">تفاصيل الطلب:</div>
        ${itemsRow}

        <div class="line"></div>

        <div class="row">
          <span>الضريبة</span>
          <span>${currencySymbol}${tax.toFixed(2)}</span>
        </div>

        <div class="row">
          <span>رسوم التوصيل</span>
          <span>${currencySymbol}${deliveryCharges.toFixed(2)}</span>
        </div>

        <div class="row bold">
          <span>الإجمالي</span>
          <span>${currencySymbol}${orderAmount.toFixed(2)}</span>
        </div>

        <div class="line"></div>

        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>${order.restaurant.name}</p>
        </div>
      </div>
    </body>
  </html>
  `
}
