import Login from "./views/Login";
import Category from "./views/Category";
import Food from "./views/Food";
import Profile from "./views/VendorProfile";
import Orders from "./views/Orders";
import Configuration from "./views/Configuration"; //uncomment this for paid version
import DemoConfiguration from "./views/Configuration1"; //comment this for paid version
import Users from "./views/Users";
import Vendors from "./views/Vendors";
import RestaurantList from "./views/RestaurantList";
import ResetPassword from "./views/ForgotPassword";
import Riders from "./views/Riders";
import Options from "./views/Options";
import Addons from "./views/Addons";
import Coupons from "./views/Coupons";
import Dashboard from "./views/Dashboard";
import Restaurant from "./views/Restaurant";
import Ratings from "./views/Rating";
import Dispatch from "./views/Dispatch";
import Timings from "./views/Timings";
import Tipping from "./views/Tipping";
import Zone from "./views/Zone";
import Sections from "./views/Sections";
import Notifications from "./views/Notifications";
import Payment from "./views/Payment";
import Commission from "./views/Commission";
import DeliveryBoundsAndLocation from "./views/DeliveryBoundsAndLocation";
import DispatchRestaurant from "./views/DispatchRestaurant";
import WithdrawRequest from "./views/WithdrawRequest";
import VendorIcon from "./assets/svg/vendor.svg?react";
import RestaurantIcon from "./assets/svg/restaurant.svg?react";
import CommissionsIcon from "./assets/svg/commission.svg?react";
import ConfigurationIcon from "./assets/svg/configuration.svg?react";
import CouponsIcon from "./assets/svg/coupons.svg?react";
import DeliveryIcon from "./assets/svg/delivery.svg?react";
import NotificationsIcon from "./assets/svg/notifications.svg?react";
import RequestIcon from "./assets/svg/request.svg?react";
import RiderIcon from "./assets/svg/riders.svg?react";
import TippingsIcon from "./assets/svg/tipping.svg?react";
import UserIcon from "./assets/svg/user.svg?react";
import ZonesIcon from "./assets/svg/zones.svg?react";
import HomeIcon from "./assets/svg/home.svg?react";
import AddonsIcon from "./assets/svg/addons.svg?react";
import BackIcon from "./assets/svg/back.svg?react";
import CategoryIcon from "./assets/svg/category.svg?react";
import DashboardIcon from "./assets/svg/dashboard.svg?react";
import FoodIcon from "./assets/svg/food.svg?react";
import LocationIcon from "./assets/svg/location.svg?react";
import OptionIcon from "./assets/svg/option.svg?react";
import OrderIcon from "./assets/svg/order.svg?react";
import PaymentIcon from "./assets/svg/payment.svg?react";
import RatingIcon from "./assets/svg/rating.svg?react";
import TimingIcon from "./assets/svg/timings.svg?react";
import RestaurantSectionIcon from "./assets/svg/restSection.svg?react";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ConnectWithoutContactIcon from "@mui/icons-material/ConnectWithoutContact";
import SuperAdminDashboard from "./views/SuperAdminDashboard";
import Cuisines from "./views/Cuisines";
import Banners from "./views/Banners";
import Cities from "./views/Cities";
import Areas from "./views/Areas";
import Businesses from "./views/Businesses";
import ShopCategories from "./views/ShopCategories";
import OrdersAdmin from "./views/OrdersAdmin";
import RidersRegistered from "./views/RidersRegistered";
import ElectricMopedIcon from "@mui/icons-material/ElectricMoped";
import OrderDetailsPage from "./views/OrderDetailsPage";
import DeliveryPrices from "./views/DeliveryPrices";
import DeliveryZone from "./views/DeliveryZone";
import BusinessCategory from "./views/BusinessCategory";
import RidersMap from "./views/RidersMap";
import ContactUs from "./views/Contactus";
import NotificationsScreen from "./views/NotificationsScreen";
import OtlobMandoob from "./views/OtlobMandoob";
import PrepaidDeliveryPackages from "./views/PrepaidDeliveryPackages";
import MultiStepperForm from "./views/MultiStepperForm";

var routes = [
  {
    path: "/dashboard",
    name: "Home",
    icon: HomeIcon,
    component: SuperAdminDashboard,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/vendors",
    name: "Vendors",
    icon: VendorIcon,
    component: Vendors,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/restaurants",
    name: "Businesses",
    icon: RestaurantIcon,
    component: RestaurantList,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/sections",
    name: "Business Sections",
    icon: RestaurantSectionIcon,
    component: Sections,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/users",
    name: "Users",
    icon: UserIcon,
    component: Users,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/riders",
    name: "Riders",
    icon: RiderIcon,
    component: Riders,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/riders-map",
    name: "Riders Map",
    icon: TravelExploreIcon,
    component: RidersMap,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/otlob-mandoob",
    name: "Otlob Mandoob",
    icon: TravelExploreIcon,
    component: OtlobMandoob,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/notifications",
    name: "notifications",
    icon: NotificationsActiveIcon,
    component: NotificationsScreen,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/configuration",
    name: "Configuration",
    icon: ConfigurationIcon,
    component: Configuration,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/contact-us",
    name: "Contact us",
    icon: CouponsIcon,
    component: ContactUs,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/delivery-packages",
    name: "Delivery Packages",
    icon: ConnectWithoutContactIcon,
    component: PrepaidDeliveryPackages,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/coupons",
    name: "Coupons",
    icon: CouponsIcon,
    component: Coupons,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/cuisines",
    name: "Cuisines",
    icon: CouponsIcon,
    component: Cuisines,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/businessCategory",
    name: "business_categories",
    icon: CouponsIcon,
    component: BusinessCategory,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/banner",
    name: "Banners",
    icon: CouponsIcon,
    component: Banners,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/tipping",
    name: "Tipping",
    icon: TippingsIcon,
    component: Tipping,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/cities",
    name: "Cities",
    icon: ZonesIcon,
    component: Cities,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/delivery-zones",
    name: "Delivery Zones",
    icon: ZonesIcon,
    component: DeliveryZone,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/multi-stepper",
    name: "MultiStepper",
    icon: ZonesIcon,
    component: MultiStepperForm,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/areas",
    name: "Areas",
    icon: ZonesIcon,
    component: Areas,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/shop-categories",
    name: "Shop Categories",
    icon: ZonesIcon,
    component: ShopCategories,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/businesses",
    name: "Businesses",
    icon: BusinessCenterIcon,
    component: Businesses,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/riders-registered",
    name: "Riders Registered",
    icon: ElectricMopedIcon,
    component: RidersRegistered,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },

  {
    path: "/zones",
    name: "Zone",
    icon: ZonesIcon,
    component: Zone,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/dispatch",
    name: "Dispatch",
    icon: DeliveryIcon,
    component: Dispatch,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/orders",
    name: "Orders",
    icon: DeliveryIcon,
    component: OrdersAdmin,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/order-details/:id",
    name: "Orders Details",
    icon: DeliveryIcon,
    component: OrderDetailsPage,
    layout: "/admin",
    appearInSidebar: false,
    admin: true,
  },
  // {
  //   path: "/notifications",
  //   name: "Notifications",
  //   icon: NotificationsIcon,
  //   component: Notifications,
  //   layout: "/super_admin",
  //   appearInSidebar: true,
  //   admin: true,
  // },
  {
    path: "/commission",
    name: "Commission Rates",
    icon: CommissionsIcon,
    component: Commission,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/withdraw/",
    name: "Withdraw Requests",
    icon: RequestIcon,
    component: WithdrawRequest,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },
  {
    path: "/list",
    name: "List",
    icon: "ni ni-tv-2 text-primary",
    component: Restaurant,
    layout: "/restaurant",
    appearInSidebar: false,
    admin: false,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: DashboardIcon,
    component: Dashboard,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/profile",
    name: "Profile",
    icon: UserIcon,
    component: Profile,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/food",
    name: "Food",
    icon: FoodIcon,
    component: Food,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/category",
    name: "Category",
    icon: CategoryIcon,
    component: Category,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/orders",
    name: "Orders",
    icon: OrderIcon,
    component: Orders,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },

  {
    path: "/option",
    name: "Option",
    icon: OptionIcon,
    component: Options,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/ratings",
    name: "Ratings",
    icon: RatingIcon,
    component: Ratings,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/addons",
    name: "Addons",
    icon: AddonsIcon,
    component: Addons,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/timings",
    name: "Timings",
    icon: TimingIcon,
    component: Timings,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
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
    path: "/deliverybounds",
    name: "Location",
    icon: LocationIcon,
    component: DeliveryBoundsAndLocation,
    layout: "/admin",
    appearInSidebar: true,
    admin: false,
  },
  {
    path: "/deliveryPrices",
    name: "Delivery Prices",
    icon: LocationIcon,
    component: DeliveryPrices,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: true,
  },

  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: Login,
    layout: "/auth",
    appearInSidebar: false,
  },
  {
    path: "/reset",
    name: "ResetPassword",
    icon: "ni ni-key-25 text-info",
    component: ResetPassword,
    layout: "/auth",
    appearInSidebar: false,
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
    path: "/vendors",
    name: "Back to Admin",
    icon: BackIcon,
    component: Vendors,
    layout: "/super_admin",
    appearInSidebar: true,
    admin: false,
  },
];
export default routes;
