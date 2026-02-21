import { Redirect } from "expo-router";

export default function RootIndex() {
  // Redirect to the default tab (todo)
  return <Redirect href="/(tabs)/todo" />;
}
