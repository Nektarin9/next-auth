import { trpc } from "@/shared/api";
import {useRouter} from "next/router";
import {BaseUrl} from "@/shared/routes/routes";

type JoinEventButtonProps = {
  eventId: number;
  onSuccess?: () => void;
  isLeave?: boolean;
  isSession?: boolean;
};

export const JoinEventButton = ({
  eventId,
  onSuccess,
  isLeave,
    isSession,
}: JoinEventButtonProps) => {
  const { mutate: join } = trpc.event.join.useMutation({ onSuccess });
  const { mutate: leave } = trpc.event.leaveEvent.useMutation({ onSuccess });
  const router = useRouter();

  const handleClick = () => {
    if (isLeave && isSession) {
      leave({id: eventId})
    }
    else if (isSession) {
      join({ id: eventId });
    }
    else {
      // Если пользователь не авторизован, редиректим на страницу авторизации
      router.push(BaseUrl.AUTH)
    }
  };

  return (
    <button
        className={`
        h-10 px-6 font-semibold rounded-md text-white
        ${isLeave ? 'bg-red-500' : 'bg-black'}
      `}
      onClick={handleClick}
    >
      {isLeave ? "Покинуть" : "Присоединиться"}
    </button>
  );
};
