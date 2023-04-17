import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { GripFoodBackEndClient, Restaurant } from '@/functions/swagger/GripFoodBackEnd';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { Page } from '@/types/Page';
import { faEdit, faPlus, faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Modal } from 'antd';
import Link from 'next/link';
import useSwr from 'swr';
import { format, parseISO } from 'date-fns';
import { id as indonesianTime } from 'date-fns/locale';

const RestaurantTableRow: React.FC<{
    restaurant: Restaurant,
    onDeleted: () => void
}> = ({ restaurant, onDeleted }) => {

    function onClickDelete() {
        Modal.confirm({
            title: `Confirm Delete`,
            content: `Delete restaurant ${restaurant.name}?`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                if (!restaurant?.id) {
                    return;
                }

                try {
                    const client = new GripFoodBackEndClient('http://localhost:3000/api/be');
                    await client.deleteRestaurant(restaurant.id);
                    onDeleted();
                } catch (err) {
                    console.error(err);
                    // feedbacknya bisa pakai antd notification
                }
            },
        });
    }

    function formatDateTime() {
        const dt = restaurant.createdAt?.toString(); // ini kan string...
        if (!dt) {
            return;
        }

        const isoDate = parseISO(dt);
        return format(isoDate, 'd MMM yyy HH:mm:ss', {
            locale: indonesianTime
        });
    }

    return (
        <tr>
            <td className="border px-4 py-2">{restaurant.id}</td>
            <td className="border px-4 py-2">{restaurant.name}</td>
            <td className="border px-4 py-2">{formatDateTime()}</td>
            <td className="border px-4 py-2">
                <Link href={`/restaurant/edit/${restaurant.id}`} className="inline-block py-1 px-2 text-xs bg-blue-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faEdit}></FontAwesomeIcon>
                    Edit
                </Link>
                <button onClick={onClickDelete} className="ml-1 py-1 px-2 text-xs bg-red-500 text-white rounded-lg">
                    <FontAwesomeIcon className='mr-1' icon={faRemove}></FontAwesomeIcon>
                    Delete
                </button>
            </td>
        </tr>
    );
};

const IndexPage: Page = () => {

    const swrFetcher = useSwrFetcherWithAccessToken();
    const { data, error, mutate } = useSwr<Restaurant[]>('/api/be/api/Restaurants', swrFetcher);

    return (
        <div>
            <Title>Manage Restaurant</Title>
            <h2 className='mb-5 text-3xl'>Manage Restaurant</h2>
            <div>
                <Link href='/restaurant/create' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block'>
                    <FontAwesomeIcon icon={faPlus} className='mr-2'></FontAwesomeIcon>
                    Create new Restaurant
                </Link>
            </div>

            {Boolean(error) && <Alert type='error' message='Cannot get restaurants data' description={String(error)}></Alert>}
            <table className='table-auto mt-5'>
                <thead className='bg-slate-700 text-white'>
                    <tr>
                        <th className='px-4 py-2'>ID</th>
                        <th className='px-4 py-2'>Name</th>
                        <th className='px-4 py-2'>Created At</th>
                        <th className='px-4 py-2'></th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((x, i) => <RestaurantTableRow key={i} restaurant={x} onDeleted={() => mutate()}></RestaurantTableRow>)}
                </tbody>
            </table>
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
