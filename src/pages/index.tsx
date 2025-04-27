import { EventCard } from "@/entities/event";
import { JoinEventButton } from "@/features/join-event";
import { trpc } from "@/shared/api";
import {AppProps} from "@/pages/_app";

export default function Home(props: AppProps) {
  const { session } = props;
  const { data, refetch } = trpc.event.findMany.useQuery();
  return (
    <ul>
      {data?.map((event) => (
        <li key={event.id} className="mb-6">
          <EventCard
            {...event}
            action={<JoinEventButton isSession={Boolean(session)} eventId={event.id} onSuccess={refetch} isLeave={event.isJoined} />}
          />
        </li>
      ))}
    </ul>
  );
}
