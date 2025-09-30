//src/utilities/formatReceipt.js
// import image from '../assets/logo_no_subtitle.jpg'
export const formatReceipt = (order, currency) => {
  // console.log({ userOrder: order.user })
  const address =
    order?.shippingMethod === 'PICKUP'
      ? 'الاستلام من الفرع'
      : `${order?.deliveryAddress?.label} ${order?.deliveryAddress?.details} ${order?.deliveryAddress?.deliveryAddress}`

  const {
    // user: { phone },
    // restaurant: { name },
    taxationAmount: tax,
    orderAmount,
    deliveryCharges,
    createdAt
  } = order

  const user = order?.user || null
  const restaurant = order?.restaurant || null
  const name = restaurant?.name || null

  const currencySymbol = currency

  const itemsRow = order?.items
    ?.map(item => {
      // Format Addons
      const addons = item.addons
        .map(
          addon => `
          <div style="font-size: 14px; margin-left: 20px;">
            ${addon.options
              .map((o, index) => {
                return `<div style="text-align: right;"> - ${o.title}: ${o.price}</div>`
              })
              .join('')}
            
          </div>
        `
        )
        .join('')

      // Item total price (variation + addon options)
      const itemTotal =
        item.variation.price +
        item.addons
          .flatMap(addon => addon.options)
          .reduce((sum, option) => sum + option.price, 0)

      return `
      <div style="padding: 6px 0;">
        <!-- Item title -->
        <div style="display: flex; flex-direction: row-reverse; align-items: center;">
          <div style="font-size: 16px; font-weight: bold; text-align: right; margin-left: 5px;">x${
            item.quantity
          } </div>
          <div style="font-size: 16px; font-weight: bold; text-align: right;">
           ${item.title}
            (<span style="text-align: right;">
              ${item.variation.title ? item.variation.title : ''}
            </span>)
        <span style="text-align: right;">${
          item.variation.price ? ` ${item.variation.price.toFixed(2)} ` : ''
        }</span> 
          </div>
        </div>
       
        <!-- Addons -->
        ${addons}

        <!-- Special Instructions -->
        ${
          item.specialInstructions
            ? `<div style="margin-top: 6px; font-size: 13px; border: 2px dashed #000; padding: 12px 6px;">
                <div style="text-align: right; font-weight: bold;">ملاحظات العميل:</div>
                <div style="text-align: right; font-weight: bold;">${item.specialInstructions}</div>
              </div>`
            : ''
        }
        <div style="border: 1px dashed #000; height: 1px; width: 100%; margin-top: 10px;"></div>
      </div>
    `
    })
    .join('')

  const date = new Date(createdAt)
  const formatter = new Intl.DateTimeFormat('ar-EG', {
    // weekday: 'long',
    // year: 'numeric',
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
      * {
        text-align: right;
      }
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
        <div style="background-color: #000; padding: 20px; width: 100%;">
          <div class="center bold" style="text-align: center; font-size: 22px; color: #fff;">Orderat - أوردرات</div>
          <div class="center bold" style="text-align: center; font-size: 22px; color: #fff;">${
            order?.orderId
          }</div>
        </div>
        <div class="center bold" style="text-align: center; font-size: 18px;">${name}</div>
		
        <div class="center" style="font-size: 16px; margin-bottom: 5px; text-align: center;">تاريخ الطلب: ${formattedDate}</div>

        <div class="line"></div>
        <div style="text-align: right;"><strong>العميل:</strong> ${
          user?.name ? user.name : 'لا يوجد اسم'
        }</div>
        <div style="text-align: right;"><strong>الهاتف:</strong> ${
          user ? user?.phone?.replace('+2', '') : 'N/A'
        }</div>
        
        <div class="line"></div>

        <div class="bold" style="margin-bottom: 6px; font-size: 16px; font-weight: bold; text-align: center;">تفاصيل الطلب</div>

        <!-- items -->
        ${itemsRow}

        <div class="line"></div>

        <div style="text-align: right; display: flex; flex-direction: row-reverse; align-items: center; justify-content: space-between;">
          <div>الضريبة</div>
          <div style="margin-right: 100px;">${tax?.toFixed(2)}</div>
        </div>

        <div style="text-align: right; display: flex; flex-direction: row-reverse; align-items: center; justify-content: space-between;">
          <div>رسوم التوصيل</div>
          <div style="margin-right: 100px;">${deliveryCharges?.toFixed(2)}</div>
        </div>

        <div class="row bold" style="text-align: right; display: flex; flex-direction: row-reverse; align-items: center; justify-content: space-between;">
          <div>الإجمالي</div>
          <div style="margin-right: 100px;">${orderAmount?.toFixed(2)}</div>
        </div>

        <div class="line"></div>

        <div class="footer" style="text-align: center;">
          <p>شكراً لتعاملكم معنا</p>
          <p>${order.restaurant.name}</p>
        </div>
      </div>
    </body>
  </html>
  `
}
