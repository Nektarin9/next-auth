import { CreateEventForm } from "@/features/create-event";
import { CreateEventSchema, trpc } from "@/shared/api";
import { useRouter } from "next/router";
import {BaseUrl} from "@/shared/routes/routes";

export default function CreateEvent() {
  const router = useRouter();

  const { mutate } = trpc.event.create.useMutation({
    onSuccess: (data) => {
      router.push(`${BaseUrl.EVENTS}/${data.id}`);
    },
  });

  const handleSubmit = (data: CreateEventSchema) => {
    mutate(data);
  };

  return <CreateEventForm onSubmit={handleSubmit} />;
}
