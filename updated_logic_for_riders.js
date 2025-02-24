const eligibleRiders = await Rider.find({ 
    isActive: true, 
    available: true 
}).lean();

// Count unassigned orders in the same zone as the order
const pendingOrders = await Order.countDocuments({
    zone: order.zone,
    rider: null,
    orderStatus: 'ACCEPTED'
});

// Determine dynamic active order cap based on available riders and pending orders
const adaptiveCap = Math.max(1, Math.min(3, Math.ceil(pendingOrders / eligibleRiders.length)));

console.log(`Adaptive Cap of Active Orders per Rider: ${adaptiveCap}`);

// Function to calculate the dynamic search radius and filter riders
const findEligibleRidersWithinRadius = async (radius) => {
    return await Promise.all(eligibleRiders.map(async rider => {
        // Step 1: Filter by adaptive active order cap
        const activeOrders = await Order.find({
            rider: rider._id,
            orderStatus: { $in: ['ACCEPTED', 'PICKED'] }
        }).lean();

        if (activeOrders.length >= adaptiveCap) return null; // Skip overloaded riders

        // Step 2: Calculate proximity to pickup location
        const distanceToPickup = getDistanceFromLatLonInKm(
            rider.location.coordinates[1], 
            rider.location.coordinates[0], 
            order.pickupLocation.lat, 
            order.pickupLocation.lng
        );

        if (distanceToPickup > radius) return null; // Skip riders beyond the dynamic radius

        // Step 3: Calculate route efficiency
        const newOrderDeliveryDistance = getDistanceFromLatLonInKm(
            order.pickupLocation.lat, 
            order.pickupLocation.lng, 
            order.deliveryLocation.lat, 
            order.deliveryLocation.lng
        );

        const integratedRouteDistance = activeOrders.reduce((totalDistance, activeOrder) => {
            const pickupToDelivery = getDistanceFromLatLonInKm(
                activeOrder.pickupLocation.lat, 
                activeOrder.pickupLocation.lng, 
                activeOrder.deliveryLocation.lat, 
                activeOrder.deliveryLocation.lng
            );

            const riderToPickup = getDistanceFromLatLonInKm(
                rider.location.coordinates[1], 
                rider.location.coordinates[0], 
                activeOrder.pickupLocation.lat, 
                activeOrder.pickupLocation.lng
            );

            return totalDistance + pickupToDelivery + riderToPickup;
        }, newOrderDeliveryDistance);

        return {
            ...rider,
            activeOrders: activeOrders.length,
            distanceToPickup,
            integratedRouteDistance
        };
    }));
};

// Dynamic radius increments (in km)
const radiusIncrements = [0.1, 0.2, 0.3, 0.4, 0.5,0.6,0.7,0.8,0.9, 1, 1.2, 1.5, 1.7, 2, 2.5,3];
let prioritizedRiders = [];

// Gradually increase the radius until 5 riders are found
for (const radius of radiusIncrements) {
    const riders = await findEligibleRidersWithinRadius(radius);
    prioritizedRiders = prioritizedRiders.concat(riders.filter(Boolean));
    if (prioritizedRiders.length >= 5) break;
}

// Sort by operational efficiency
const sortedRiders = prioritizedRiders.filter(Boolean).sort((a, b) => (
    a.distanceToPickup - b.distanceToPickup ||       // Closer to pickup location
    a.integratedRouteDistance - b.integratedRouteDistance || // More efficient route
    a.activeOrders - b.activeOrders // Prioritize riders with fewer active orders
));

// Select top 5 riders based on efficiency
const top5Riders = sortedRiders.slice(0, 5);

// Notify the top 5 riders simultaneously
top5Riders.forEach(rider => {
    sendNotificationToUser(rider._id, order);
});

// Handle order acceptance
pubsub.asyncIterator('ORDER_ACCEPTED').then(acceptedOrder => {
    const acceptedRider = top5Riders.find(r => r._id === acceptedOrder.rider);
    if (acceptedRider) {
        console.log(`Order accepted by Rider: ${acceptedRider.name}`);
        // Retract the order from other riders
        top5Riders
            .filter(r => r._id !== acceptedRider._id)
            .forEach(r => sendNotificationToUser(r._id, { type: 'ORDER_RETRACTED', orderId: order._id }));
    }
});
