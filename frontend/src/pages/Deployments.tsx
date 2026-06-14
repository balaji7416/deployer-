import { useDeployments } from "@/hooks/useDeployments";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Deployments() {
  const { deployments } = useDeployments();
  return (
    <div className="text-neutral-200 mx-auto h-screen overflow-y-auto">
      <h1>Deployments</h1>
      {deployments.length === 0 && <p>No deployments found</p>}
      {deployments &&
        deployments.map((depl) => (
          <Card>
            <CardHeader>
              <CardTitle>{depl?.name}</CardTitle>
              <CardDescription>Card Description</CardDescription>
              <CardAction>Card Action</CardAction>
            </CardHeader>
            <CardContent>
              <p>Card Content</p>
            </CardContent>
            <CardFooter>
              <p>Card Footer</p>
            </CardFooter>
          </Card>
        ))}
    </div>
  );
}

export default Deployments;
