import Login from './views/Login'
import Category from './views/Category'
import Food from './views/Food'
import Profile from './views/VendorProfile'
import Orders from './views/Orders'
import Configuration from './views/Configuration' //uncomment this for paid version
import DemoConfiguration from './views/Configuration1' //comment this for paid version
import Users from './views/Users'
import Vendors from './views/Vendors'
import RestaurantList from './views/RestaurantList'
import ResetPassword from './views/ForgotPassword'
import Riders from './views/Riders'
import Options from './views/Options'
import Addons from './views/Addons'
import Coupons from './views/Coupons'
import Dashboard from './views/Dashboard'
import Restaurant from './views/Restaurant'
import Ratings from './views/Rating'
import Dispatch from './views/Dispatch'
import Timings from './views/Timings'
import Tipping from './views/Tipping'
import Zone from './views/Zone'
import Sections from './views/Sections'
import Notifications from './views/Notifications'
import Payment from './views/Payment'
import Commission from './views/Commission'
import DeliveryBoundsAndLocation from './views/DeliveryBoundsAndLocation'
import DispatchRestaurant from './views/DispatchRestaurant'
import WithdrawRequest from './views/WithdrawRequest'
import { ReactComponent as VendorIcon } from './assets/svg/vendor.svg'
import { ReactComponent as RestaurantIcon } from './assets/svg/restaurant.svg'
import { ReactComponent as CommissionsIcon } from './assets/svg/commission.svg'
import { ReactComponent as ConfigurationIcon } from './assets/svg/configuration.svg'
import { ReactComponent as CouponsIcon } from './assets/svg/coupons.svg'
import { ReactComponent as DeliveryIcon } from './assets/svg/delivery.svg'
import { ReactComponent as NotificationsIcon } from './assets/svg/notifications.svg'
import { ReactComponent as RequestIcon } from './assets/svg/request.svg'
import { ReactComponent as RiderIcon } from './assets/svg/riders.svg'
import { ReactComponent as TippingsIcon } from './assets/svg/tipping.svg'
import { ReactComponent as UserIcon } from './assets/svg/user.svg'
import { ReactComponent as ZonesIcon } from './assets/svg/zones.svg'
import { ReactComponent as HomeIcon } from './assets/svg/home.svg'
import { ReactComponent as AddonsIcon } from './assets/svg/addons.svg'
import { ReactComponent as BackIcon } from './assets/svg/back.svg'
import { ReactComponent as CategoryIcon } from './assets/svg/category.svg'
import { ReactComponent as DashboardIcon } from './assets/svg/dashboard.svg'
import { ReactComponent as FoodIcon } from './assets/svg/food.svg'
import { ReactComponent as LocationIcon } from './assets/svg/location.svg'
import { ReactComponent as OptionIcon } from './assets/svg/option.svg'
import { ReactComponent as OrderIcon } from './assets/svg/order.svg'
import { ReactComponent as PaymentIcon } from './assets/svg/payment.svg'
import { ReactComponent as RatingIcon } from './assets/svg/rating.svg'
import { ReactComponent as TimingIcon } from './assets/svg/timings.svg'
import { ReactComponent as RestaurantSectionIcon } from './assets/svg/restSection.svg'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact'
import SuperAdminDashboard from './views/SuperAdminDashboard'
import Cuisines from './views/Cuisines'
import Banners from './views/Banners'
import Cities from './views/Cities'
import Areas from './views/Areas'
import Businesses from './views/Businesses'
import ShopCategories from './views/ShopCategories'
import OrdersAdmin from './views/OrdersAdmin'
import RidersRegistered from './views/RidersRegistered'
import ElectricMopedIcon from '@mui/icons-material/ElectricMoped'
import OrderDetailsPage from './views/OrderDetailsPage'
import DeliveryPrices from './views/DeliveryPrices'
import DeliveryZone from './views/DeliveryZone'
import BusinessCategory from './views/BusinessCategory'
import RidersMap from './views/RidersMap'
import ContactUs from './views/Contactus'
import NotificationsScreen from './views/NotificationsScreen'
import OtlobMandoob from './views/OtlobMandoob'
import PrepaidDeliveryPackages from './views/PrepaidDeliveryPackages'

var routes = [
  {
    path: '/dashboard',
    name: 'Home',
    icon: HomeIcon,
    component: SuperAdminDashboard,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/vendors',
    name: 'Vendors',
    icon: VendorIcon,
    component: Vendors,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/restaurants',
    name: 'Businesses',
    icon: RestaurantIcon,
    component: RestaurantList,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/sections',
    name: 'Business Sections',
    icon: RestaurantSectionIcon,
    component: Sections,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/users',
    name: 'Users',
    icon: UserIcon,
    component: Users,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/riders',
    name: 'Riders',
    icon: RiderIcon,
    component: Riders,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/riders-map',
    name: 'Riders Map',
    icon: TravelExploreIcon,
    component: RidersMap,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/otlob-mandoob',
    name: 'Otlob Mandoob',
    icon: TravelExploreIcon,
    component: OtlobMandoob,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/notifications',
    name: 'notifications',
    icon: NotificationsActiveIcon,
    component: NotificationsScreen,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/configuration',
    name: 'Configuration',
    icon: ConfigurationIcon,
    component: Configuration,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/contact-us',
    name: 'Contact us',
    icon: CouponsIcon,
    component: ContactUs,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/delivery-packages',
    name: 'Delivery Packages',
    icon: ConnectWithoutContactIcon,
    component: PrepaidDeliveryPackages,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/coupons',
    name: 'Coupons',
    icon: CouponsIcon,
    component: Coupons,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/cuisines',
    name: 'Cuisines',
    icon: CouponsIcon,
    component: Cuisines,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/businessCategory',
    name: 'business_categories',
    icon: CouponsIcon,
    component: BusinessCategory,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/banner',
    name: 'Banners',
    icon: CouponsIcon,
    component: Banners,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/tipping',
    name: 'Tipping',
    icon: TippingsIcon,
    component: Tipping,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/cities',
    name: 'Cities',
    icon: ZonesIcon,
    component: Cities,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/delivery-zones',
    name: 'Delivery Zones',
    icon: ZonesIcon,
    component: DeliveryZone,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/areas',
    name: 'Areas',
    icon: ZonesIcon,
    component: Areas,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/shop-categories',
    name: 'Shop Categories',
    icon: ZonesIcon,
    component: ShopCategories,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/businesses',
    name: 'Businesses',
    icon: BusinessCenterIcon,
    component: Businesses,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/riders-registered',
    name: 'Riders Registered',
    icon: ElectricMopedIcon,
    component: RidersRegistered,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },

  {
    path: '/zones',
    name: 'Zone',
    icon: ZonesIcon,
    component: Zone,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/dispatch',
    name: 'Dispatch',
    icon: DeliveryIcon,
    component: Dispatch,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/orders',
    name: 'Orders',
    icon: DeliveryIcon,
    component: OrdersAdmin,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/order-details/:id',
    name: 'Orders Details',
    icon: DeliveryIcon,
    component: OrderDetailsPage,
    layout: '/admin',
    appearInSidebar: false,
    admin: true
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: NotificationsIcon,
    component: Notifications,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/commission',
    name: 'Commission Rates',
    icon: CommissionsIcon,
    component: Commission,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/withdraw/',
    name: 'Withdraw Requests',
    icon: RequestIcon,
    component: WithdrawRequest,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },
  {
    path: '/list',
    name: 'List',
    icon: 'ni ni-tv-2 text-primary',
    component: Restaurant,
    layout: '/restaurant',
    appearInSidebar: false,
    admin: false
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: DashboardIcon,
    component: Dashboard,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/profile',
    name: 'Profile',
    icon: UserIcon,
    component: Profile,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/food',
    name: 'Food',
    icon: FoodIcon,
    component: Food,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/category',
    name: 'Category',
    icon: CategoryIcon,
    component: Category,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/orders',
    name: 'Orders',
    icon: OrderIcon,
    component: Orders,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },

  {
    path: '/option',
    name: 'Option',
    icon: OptionIcon,
    component: Options,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/ratings',
    name: 'Ratings',
    icon: RatingIcon,
    component: Ratings,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/addons',
    name: 'Addons',
    icon: AddonsIcon,
    component: Addons,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/timings',
    name: 'Timings',
    icon: TimingIcon,
    component: Timings,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  // {
  //   path: '/payment',
  //   name: 'Payment',
  //   icon: PaymentIcon,
  //   component: Payment,
  //   layout: '/admin',
  //   appearInSidebar: true,
  //   admin: false
  // },
  {
    path: '/deliverybounds',
    name: 'Location',
    icon: LocationIcon,
    component: DeliveryBoundsAndLocation,
    layout: '/admin',
    appearInSidebar: true,
    admin: false
  },
  {
    path: '/deliveryPrices',
    name: 'Delivery Prices',
    icon: LocationIcon,
    component: DeliveryPrices,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: true
  },

  {
    path: '/login',
    name: 'Login',
    icon: 'ni ni-key-25 text-info',
    component: Login,
    layout: '/auth',
    appearInSidebar: false
  },
  {
    path: '/reset',
    name: 'ResetPassword',
    icon: 'ni ni-key-25 text-info',
    component: ResetPassword,
    layout: '/auth',
    appearInSidebar: false
  },
  // {
  //   path: '/dispatch/:id',
  //   name: 'Dispatch',
  //   icon: DeliveryIcon,
  //   component: DispatchRestaurant,
  //   layout: '/admin',
  //   appearInSidebar: true,
  //   admin: false
  // },
  {
    path: '/vendors',
    name: 'Back to Admin',
    icon: BackIcon,
    component: Vendors,
    layout: '/super_admin',
    appearInSidebar: true,
    admin: false
  }
]
export default routes
