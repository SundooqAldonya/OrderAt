import { gql, useQuery } from "@apollo/client";
import { restaurant, restaurantCustomer } from "../apollo/server";

const RESTAURANT = gql`
  ${restaurantCustomer}
`;

export default function useRestaurant(id, slug) {
  const { data, refetch, networkStatus, loading, error } = useQuery(
    RESTAURANT,
    {
      variables: { id, slug },
      fetchPolicy: "network-only",
    }
  );
  console.log({ data });
  return { data, refetch, networkStatus, loading, error };
}
