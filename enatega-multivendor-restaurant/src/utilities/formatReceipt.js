export const formatReceipt = order => {
  const address =
    order.shippingMethod === 'PICKUP'
      ? 'PICKUP'
      : `${order.deliveryAddress.label} ${order.deliveryAddress.details} ${order.deliveryAddress.deliveryAddress}`
  const {
    user: { email, phone },
    taxationAmount: tax,
    tipping: tip,
    paidAmount,
    orderAmount
  } = order
  const deliveryCharges = order.deliveryCharges
  const itemsRow = order.items
    .map(
      item => `
    <tr class="service">
      <td class="tableitem">
        <p class="itemtext">
          ${item.title}${
        item.variation.title ? ':' + item.variation.title : ''
      } 
          ${item.addons
            .map(
              addon =>
                `<br>${addon.title}: ${addon.options
                  .map(option => option.title)
                  .join(', ')}`
            )
            .join('')}
        </p>
      </td>
      <td class="tableitem">
        <p class="itemtext">${item.quantity}</p>
      </td>
      <td class="tableitem">
        <p class="itemtext">${order.currencySymbol}${(
        item.variation.price +
        item.addons
          .map(addon =>
            addon.options.reduce((prev, curr) => prev + curr.price, 0)
          )
          .reduce((prev, curr) => prev + curr, 0)
      ).toFixed(2)}</p>
      </td>
    </tr>
  `
    )
    .join('')

  // The container width is set to 100% with a max-width that should be passed via the print options (or defined via a CSS variable)
  return `
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
      /* Reset some defaults */
      body, h1, h2, h3, p, table { margin: 0; padding: 0; }
      body { font-family: sans-serif; color: #333; }
      #invoice-POS {
        width: 100%;
        max-width: var(--receipt-width, 227px); /* Use a CSS variable to set width based on paper size (227px for 80mm, 164px for 58mm) */
        margin: auto;
        background: #FFF;
        padding: 5px;
      }
      /* Header styling */
      #top {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px dashed #CCC;
      }
      #top .logo {
        height: 50px;
        width: 50px;
        margin: 0 auto;
        background: url('http://michaeltruong.ca/images/logo1.png') no-repeat center;
        background-size: contain;
      }
      #top .info h2 {
        font-size: 1em;
        margin: 5px 0;
      }
      /* Contact information styling */
      #mid {
        text-align: center;
        padding: 8px 0;
        border-bottom: 1px dashed #CCC;
      }
      #mid h2 {
        font-size: 0.9em;
        margin-bottom: 3px;
      }
      #mid p {
        font-size: 0.7em;
        line-height: 1.2em;
      }
      /* Table styling for order items */
      #bot {
        padding-top: 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      .tabletitle h2 {
        font-size: 0.7em;
        text-align: left;
      }
      .service { 
        border-bottom: 1px dashed #EEE; 
      }
      .tableitem {
        padding: 2px 0;
      }
      .itemtext {
        font-size: 0.65em;
        word-wrap: break-word;
      }
      /* Totals and payment section */
      .payment h2 {
        font-size: 0.75em;
        text-align: right;
      }
      .legal {
        font-size: 0.65em;
        text-align: center;
        margin-top: 5px;
      }
    </style>
  </head>
  <body>
    <div id="invoice-POS">
      <div id="top">
        <div class="logo"></div>
        <div class="info">
          <h2>Orderat Business</h2>
        </div>
      </div>
      
      <div id="mid">
        <h2>Contact Info</h2>
        <p>
          Address : ${address} <br/>
          Email   : ${email} <br/>
          Phone   : ${phone} <br/>
        </p>
      </div>
      
      <div id="bot">
        <table>
          <tr class="tabletitle">
            <td class="item"><h2>Item</h2></td>
            <td class="qty"><h2>Qty</h2></td>
            <td class="rate"><h2>Sub Total</h2></td>
          </tr>
          ${itemsRow}
          <tr class="tabletitle">
            <td></td>
            <td class="rate"><h2>Tax</h2></td>
            <td class="payment"><h2>${order.currencySymbol}${tax.toFixed(
    2
  )}</h2></td>
          </tr>
          <tr class="tabletitle">
            <td></td>
            <td class="rate"><h2>Tip</h2></td>
            <td class="payment"><h2>${order.currencySymbol}${tip.toFixed(
    2
  )}</h2></td>
          </tr>
          <tr class="tabletitle">
            <td></td>
            <td class="rate"><h2>Delivery ch.</h2></td>
            <td class="payment"><h2>${
              order.currencySymbol
            }${deliveryCharges.toFixed(2)}</h2></td>
          </tr>
          <tr class="tabletitle">
            <td></td>
            <td class="rate"><h2>Total</h2></td>
            <td class="payment"><h2>${
              order.currencySymbol
            }${orderAmount.toFixed(2)}</h2></td>
          </tr>
          <tr class="tabletitle">
            <td></td>
            <td class="rate"><h2>Paid</h2></td>
            <td class="payment"><h2>${order.currencySymbol}${paidAmount.toFixed(
    2
  )}</h2></td>
          </tr>
        </table>
        <p class="legal"><strong>Thank you for your business!</strong></p>
      </div>
    </div>
  </body>
  `
}

// export const formatReceipt = order => {
//   const address =
//     order.shippingMethod === 'PICKUP'
//       ? 'PICKUP'
//       : `${order.deliveryAddress.label} ${order.deliveryAddress.details} ${order.deliveryAddress.deliveryAddress}`
//   const {
//     user: { email, phone },
//     taxationAmount: tax,
//     tipping: tip,
//     paidAmount,
//     orderAmount
//   } = order
//   const deliveryCharges = order.deliveryCharges
//   const itemsRow = `${order.items.map(
//     item => `<tr className="service">
//     <td className="tableitem"><p className="itemtext">${item.title}${
//       item.variation.title ? ':' + item.variation.title : ''
//     },${item.addons
//       .map(
//         addon =>
//           `<br>${addon.title}: ` +
//           addon.options.map(option => option.title).join(',')
//       )
//       .join(',')}</p></td>
//     <td className="tableitem"><p className="itemtext">${item.quantity}</p></td>
//     <td className="tableitem"><p className="itemtext">${order.currencySymbol}${(
//       item.variation.price +
//       item.addons
//         .map(addon =>
//           addon.options.reduce((prev, curr) => prev + curr.price, 0)
//         )
//         .reduce((prev, curr) => prev + curr, 0)
//     ).toFixed(2)}</p></td>
//   </tr>`
//   )}`
//   return `<head>
//   <style>
//     #invoice-POS{
//   margin: 0 auto;
//   background: #FFF;
//     }
//   h1{
//   font-size: 1.5em;
//   color: #222;
//   }
//   h2{font-size: .9em;}
//   h3{
//   font-size: 1.2em;
//   font-weight: 300;
//   line-height: 2em;
//   }
//   p{
//   font-size: .7em;
//   color: #666;
//   line-height: 1.2em;
//   }
//   #top, #mid,#bot{ /* Targets all id with 'col-' */
//   border-bottom: 1px solid #EEE;
//   }
//   #top{min-height: 100px;}
//   #mid{min-height: 80px;}
//   #bot{ min-height: 50px;}
//   #top .logo{
//   height: 60px;
//   width: 60px;
//   background: url(http://michaeltruong.ca/images/logo1.png) no-repeat;
//   background-size: 60px 60px;
//   }
//   .clientlogo{
//   float: left;
//   height: 60px;
//   width: 60px;
//   background: url(http://michaeltruong.ca/images/client.jpg) no-repeat;
//   background-size: 60px 60px;
//   border-radius: 50px;
//   }
//   .info{
//   display: block;
//   margin-left: 0;
//   }
//   .title{
//   float: right;
//   }
//   .title p{text-align: right;}
//   table{
//   width: 100%;
//   border-collapse: collapse;
//   }
//   .tabletitle{
//   font-size: .5em;
//   }
//   .service{border-bottom: 1px solid #EEE;}
//   .item{width: 24mm;}
//   .itemtext{font-size: .5em;}
//   #legalcopy{
//   margin-top: 5mm;
//   }
//   </style>
//   <meta
//     name="viewport"
//     content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
//   />
//   </head>
//   <body style="text-align: center">
//   <div id="invoice-POS">
//     <center id="top">
//       <div class="logo"></div>
//       <div class="info">
//         <h2>Orderat Business</h2>
//       </div><!--End Info-->
//     </center><!--End InvoiceTop-->

//     <div id="mid">
//       <div class="info">
//         <h2>Contact Info</h2>
//         <p>
//             Address : ${address}</br>
//             Email   : ${email}</br>
//             Phone   : ${phone}</br>
//         </p>
//       </div>
//     </div><!--End Invoice Mid-->

//     <div id="bot">
//           <div id="table">
//             <table>
//               <tr class="tabletitle">
//                 <td class="item"><h2>Item</h2></td>
//                 <td class="Hours"><h2>Qty</h2></td>
//                 <td class="Rate"><h2>Sub Total</h2></td>
//               </tr>
//               ${itemsRow}
//               <tr class="tabletitle">
//                 <td></td>
//                 <td class="Rate"><h2>Tax</h2></td>
//                 <td class="payment"><h2>${order.currencySymbol}${tax.toFixed(
//     2
//   )}</h2></td>
//               </tr>
//               <tr class="tabletitle">
//                 <td></td>
//                 <td class="Rate"><h2>Tip</h2></td>
//                 <td class="payment"><h2>${order.currencySymbol}${tip.toFixed(
//     2
//   )}</h2></td>
//               </tr>
//               <tr class="tabletitle">
//                 <td></td>
//                 <td class="Rate"><h2>Delivery ch.</h2></td>
//                 <td class="payment"><h2>${
//                   order.currencySymbol
//                 }${deliveryCharges.toFixed(2)}</h2></td>
//               </tr>
//               <tr class="tabletitle">
//                 <td></td>
//                 <td class="Rate"><h2>Total</h2></td>
//                 <td class="payment"><h2>${
//                   order.currencySymbol
//                 }${orderAmount.toFixed(2)}</h2></td>
//               </tr>
//               <tr class="tabletitle">
//                 <td></td>
//                 <td class="Rate"><h2>Paid</h2></td>
//                 <td class="payment"><h2>${
//                   order.currencySymbol
//                 }${paidAmount.toFixed(2)}</h2></td>
//               </tr>
//             </table>
//           </div><!--End Table-->
//           <div id="legalcopy">
//             <p class="legal"><strong>Thank you for your business!</strong>
//             </p>
//           </div>
//         </div><!--End InvoiceBot-->
//   </div><!--End Invoice-->
//   </body>`
// }
