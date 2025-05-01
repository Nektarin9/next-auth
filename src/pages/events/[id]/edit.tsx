import {useRouter} from "next/router";
import {CreateEventSchema, trpc} from "@/shared/api";
import {BaseUrl} from "@/shared/routes/routes";
import {CreateEventForm} from "@/features/create-event";
import {AppProps} from "@/pages/_app";

export default function EditEvent(props: AppProps) {
    const router = useRouter();
    const { session } = props;

    const { data } = trpc.event.findUnique.useQuery({
        id: Number(router.query.id),
    });
    const { mutate: updateEvent } = trpc.event.update.useMutation({
        onSuccess: (data) => {
            router.push(`${BaseUrl.EVENTS}/${data.id}`);
        },
    });


    function toDateInputValue(date?: string | Date): string {
        if (!date) return "";
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toISOString().split('T')[0];
    }


    const defaultValues = {
        title: data?.title || "",
        description: data?.description || "",
        date: data?.date ?  toDateInputValue(data.date) : new Date(),
    }

    const handleSubmit = (formData: CreateEventSchema) => {
        if (data) {
            updateEvent({
                eventId: Number(router.query.id),
                ...formData
            })
        }
    };
    // Если запрещаем показывать страницу, если пользователь не автор
    const isEdit = session && session.user.id === data?.authorId ;

    return (
        <>
            {isEdit ?
                <CreateEventForm defaultValues={defaultValues} onSubmit={handleSubmit} />
                :
                <h1>Вы не автор, а ну прочь :)</h1>}
        </>
    )
}

