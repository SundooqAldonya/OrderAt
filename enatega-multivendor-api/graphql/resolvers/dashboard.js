const Order = require('../../models/order')
const { months } = require('../../helpers/enum')
module.exports = {
  Query: {
    getDashboardTotal: async(_, args, context) => {
      console.log('getDashboardTotal', args)
      try {
        const starting_date = new Date(args.starting_date)
        const ending_date = new Date(args.ending_date)
        ending_date.setDate(ending_date.getDate() + 1)
        const filter_date = {
          createdAt: { $gte: starting_date, $lt: ending_date }
        }
        const orders_count = await Order.countDocuments({
          ...filter_date,
          restaurant: args.restaurant,
          orderStatus: 'DELIVERED'
        })
        const paid_orders = await Order.find({
          ...filter_date,
          orderStatus: 'DELIVERED',
          restaurant: args.restaurant
        }).select('orderAmount')
        const sales_amount = paid_orders.reduce(
          (acc, order) => acc + order.orderAmount,
          0
        )
        return {
          totalOrders: orders_count,
          totalSales: sales_amount.toFixed(2)
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getDashboardSales: async(_, args, context) => {
      console.log('getDashboardSales', args)
      try {
        const ending_date = new Date(args.ending_date)
        ending_date.setDate(ending_date.getDate() + 1)
        const sales_value = []
        const current_date = new Date(args.starting_date)
        // eslint-disable-next-line no-unmodified-loop-condition
        while (current_date < ending_date) {
          const filter_start = new Date(current_date)
          const filter_end = new Date(filter_start).setDate(
            filter_start.getDate() + 1
          )
          const filter = { createdAt: { $gte: filter_start, $lt: filter_end } }
          const orders = await Order.find({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant
          }).select('orderAmount')
          const day = `${
            months[current_date.getMonth()]
          } ${current_date.getDate()}`
          const temp_sales_value = { day }
          temp_sales_value.amount = orders
            .reduce((acc, order) => acc + order.orderAmount, 0)
            .toFixed(2)
          sales_value.push(temp_sales_value)
          current_date.setDate(current_date.getDate() + 1)
        }
        return {
          orders: sales_value
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    },
    getDashboardOrders: async(_, args, context) => {
      console.log('getDashboardOrders', args)
      try {
        const ending_date = new Date(args.ending_date)
        ending_date.setDate(ending_date.getDate() + 1)
        const sales_value = []
        const current_date = new Date(args.starting_date)
        // eslint-disable-next-line no-unmodified-loop-condition
        while (current_date < ending_date) {
          const filter_start = new Date(current_date)
          const filter_end = new Date(filter_start).setDate(
            filter_start.getDate() + 1
          )
          const filter = { createdAt: { $gte: filter_start, $lt: filter_end } }
          const day = `${
            months[current_date.getMonth()]
          } ${current_date.getDate()}`
          const temp_sales_value = { day }
          temp_sales_value.count = await Order.countDocuments({
            ...filter,
            orderStatus: 'DELIVERED',
            restaurant: args.restaurant
          })
          sales_value.push(temp_sales_value)
          current_date.setDate(current_date.getDate() + 1)
        }
        return {
          orders: sales_value
        }
      } catch (err) {
        console.log(err)
        throw err
      }
    }
  },
  Mutation: {}
}
