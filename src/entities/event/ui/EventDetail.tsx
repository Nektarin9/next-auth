import Link from "next/link";
import {BaseUrl} from "@/shared/routes/routes";
import {useRouter} from "next/router";
import {SessionType} from "@/pages/_app";


interface EventDetailProps {
  title: string;
  description: string;
  date: Date;
  participations:  { user: { name: string } }[]
  session: SessionType | null
  authorId: number;


}

export const EventDetail = ({
  title,
  description,
  date,
  participations,
  session,
  authorId
}: EventDetailProps) => {
  const { asPath } = useRouter();

// Скрываем кнопку если это не автор
  const isEditButtonShow = session && session.user.id === authorId ;

  return (
    <div>
      <div className="px-4 sm:px-0 flex justify-between">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          Информация о событии
        </h3>
        {isEditButtonShow &&
            <Link href={`${asPath}${BaseUrl.EDIT_EVENT}`}>
              <button className="bg-blue-500 w-[150px] h-[35px] text-white rounded">
                Редактировать
              </button>
            </Link>
        }

      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Название
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {title}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Описание
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {description}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Дата проведения
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {date.toLocaleDateString()}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Участники
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {participations.map(({ user }) => user.name).join(", ")}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
