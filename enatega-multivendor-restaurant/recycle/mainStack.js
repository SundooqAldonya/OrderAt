const client = useApolloClient()
const navigation = useNavigation()
const lastNotificationResponse = Notifications.useLastNotificationResponse()
const handleNotification = useCallback(
  async response => {
    const { _id } = response.notification.request.content.data
    const { data } = await client.query({
      query: gql`
        ${orders}
      `,
      fetchPolicy: 'network-only'
    })
    const order = data.restaurantOrders.find(o => o._id === _id)
    const acceptanceTime = moment(new Date(order.orderDate)).diff(
      new Date(),
      'seconds'
    )
    var remainingTime = moment(new Date(order.createdAt))
      .add(MAX_TIME, 'seconds')
      .diff(new Date(), 'seconds')

    const lastNotificationHandledId = await AsyncStorage.getItem(
      '@lastNotificationHandledId'
    )
    if (lastNotificationHandledId === _id) return
    await AsyncStorage.setItem('@lastNotificationHandledId', _id)
    navigation.navigate('OrderDetail', {
      activeBar: 0,
      orderData: order,
      remainingTime,
      createdAt: order.createdAt,
      acceptanceTime,
      preparationTime: order.preparationTime
    })
  },
  [lastNotificationResponse]
)
React.useEffect(() => {
  if (
    lastNotificationResponse &&
    lastNotificationResponse.notification.request.content.data.type ===
      'order' &&
    lastNotificationResponse.actionIdentifier ===
      Notifications.DEFAULT_ACTION_IDENTIFIER
  ) {
    handleNotification(lastNotificationResponse)
  }
}, [lastNotificationResponse])
