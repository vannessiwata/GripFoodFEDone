import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import useSwr from 'swr';
import { Restaurant } from '@/functions/swagger/GripFoodBackEnd';
import Link from 'next/link';

const RestaurantDisplayItem: React.FC<{
    restaurant: Restaurant
}> = ({ restaurant }) => {

    return (
        <div className='border border-gray-400 rounded-xl p-8 flex flex-col items-center bg-white shadow-lg'>
            <div className='bg-slate-400 h-[160px] w-full'></div>
            <div className='mt-4 text-2xl font-bold'>{restaurant.name}</div>
            <div className='mt-4 w-full flex'>
                <div className='flex-[3] pl-2'>
                    <Link className='block w-full font-bold text-sm p-1 rounded-md bg-blue-500 active:bg-blue-700 text-center text-white' href={`./restaurant/${restaurant.id}`}>
                        Show Menu
                    </Link>
                </div>

            </div>
        </div>
    );
};

const InnerIndexPage: React.FC = () => {
    const fetcher = useSwrFetcherWithAccessToken();
    const { data } = useSwr<Restaurant[]>('/api/be/api/Restaurants', fetcher);

    return (
        <div>
            <Title>Home</Title>
            <div className='grid grid-cols-5 gap-5'>
                {data?.map((x, i) => <RestaurantDisplayItem key={i} restaurant={x} />)}
            </div>
        </div>
    );
}

const IndexPage: Page = () => {
    return (
        <InnerIndexPage></InnerIndexPage>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;