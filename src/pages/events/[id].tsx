import { EventDetail } from "@/entities/event";
import { trpc } from "@/shared/api";
import { useRouter } from "next/router";
import {AppProps} from "@/pages/_app";

export default function Event(props: AppProps) {
  const router = useRouter();
  const { session } = props;

  const { data, isLoading } = trpc.event.findUnique.useQuery({
    id: Number(router.query.id),
  });


  if (isLoading) {
    return "Loading...";
  }

  if (session?.status === "unauthenticated") {
    return "Forbidden";
  }

  if (!data) {
    return "No data";
  }

  const eventData = {
    ...data,
    description: data.description ?? '',
    session: props.session
  };

  return <EventDetail {...eventData} />;
}
