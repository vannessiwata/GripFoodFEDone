import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { FoodItem } from '@/functions/swagger/GripFoodBackEnd';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { Page } from '@/types/Page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';

const FoodItemDisplayItem: React.FC<{
    foodItem: FoodItem
}> = ({ foodItem }) => {

    return (
        <div className='border border-gray-400 rounded-xl p-8 flex flex-col items-center mt-2 bg-white shadow-lg'>
            <div className='bg-slate-400 h-[160px] w-full'></div>
            <div className='mt-4 text-2xl font-bold'>{foodItem.name}</div>
            <div className='mt-4 text-2xl'>{foodItem.price}</div>
            <div className='mt-4 w-full flex'>
                <div className='flex-[3] pl-2'>
                    <Link href={`../../add-to-cart/${foodItem.id}`} className='block w-full text-center p-1 text-sm rounded-md bg-blue-500 active:bg-blue-700 text-white' type='button'>
                        <FontAwesomeIcon icon={faCartPlus} className='mr-3'></FontAwesomeIcon>
                        Add to cart
                    </Link>
                </div>

            </div>
        </div>
    );
};

const IndexPage: Page = () => {
    const router = useRouter();
    const { id } = router.query;

    const swrFetcher = useSwrFetcherWithAccessToken();
    const { data } = useSwr<FoodItem[]>(`/api/be/api/FoodItems/${id}`, swrFetcher);

    return (
        <div>
            <Title>Menu</Title>
            <Link href='/'>Return to Index</Link>

            <h2 className='mb-5 text-3xl'>Menu</h2>
            <div>
                <Link href={`/order-summary/${id}`} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block'>
                    Checkout
                </Link>
            </div>
            {data?.map((x, i) => <FoodItemDisplayItem key={i} foodItem={x}></FoodItemDisplayItem>)}
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
