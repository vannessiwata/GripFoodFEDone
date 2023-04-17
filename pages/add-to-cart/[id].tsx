import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { FoodItem, GripFoodBackEndClient } from '@/functions/swagger/GripFoodBackEnd';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { Page } from '@/types/Page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import useSwr from 'swr';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { useAuthorizationContext } from '@/functions/AuthorizationContext';
import { Button, notification } from 'antd';
import { Authorize } from '@/components/Authorize';

const FoodItemDisplayItem: React.FC<{
    foodItem: FoodItem
}> = ({ foodItem }) => {

    const [qty, setQty] = useState(1);

    const price = foodItem.price ? foodItem.price : 1;

    const { accessToken } = useAuthorizationContext();

    async function addToCart() {
        const client = new GripFoodBackEndClient('http://localhost:3000/api/be', {
            fetch(url, init) {
                if (init && init.headers) {
                    init.headers['Authorization'] = `Bearer ${accessToken}`
                }
                return fetch(url, init);
            }
        });
        try {
            await client.addToCart({
                foodItemId: foodItem.id,
                restaurantId: foodItem.restaurantId,
                qty: qty
            });
            notification.success({
                type: 'success',
                placement: 'bottomRight',
                message: 'Added to cart',
                description: `Added ${qty} ${foodItem.name} to cart`
            });
        } catch (err) {
            notification.error({
                type: 'error',
                placement: 'bottomRight',
                message: 'Failed to add to cart',
                description: String(err)
            });
        }
    }

    return (
        <div className='border border-gray-400 rounded-xl p-8 flex flex-col ml-5 mt-2 bg-white shadow-lg'>
            <div className='mt-4 text-2xl font-bold'>{`Nama = ${foodItem.name}`}</div>
            <div className='mt-4 text-2xl'>{`Harga = ${foodItem.price}`}</div>
            <div className='mt-4 w-[50px] text-2xl'>Quantity</div>
            <div className='flex-[1]'>
                <input value={qty} type='number' onChange={t => setQty(t.target.valueAsNumber)}
                    className='block w-full p-1 text-sm rounded-md border-gray-500 border-solid border'></input>
            </div>
            <div className='mt-4 text-2xl'>{`Total Harga = ${price * qty}`}</div>
            <div className='mt-4 w-full flex'>
                <div className='flex-[3] pl-2'>
                    <Link href={`../restaurant/${foodItem.restaurantId}`}>
                        <Button onClick={addToCart} className='block w-full p-1 text-sm rounded-md bg-blue-500 active:bg-blue-700 text-white'>
                            <FontAwesomeIcon icon={faCartPlus} className='mr-3'></FontAwesomeIcon>
                            Add to cart
                        </Button>
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
    const itemFoodUris = id ? `/api/be/api/FoodItems/cart/${id}` : undefined;
    const { data } = useSwr<FoodItem>(itemFoodUris, swrFetcher);

    function renderGrid() {
        if (!id || typeof id !== 'string') {
            return;
        }

        if (!data) {
            return;
        }

        return <FoodItemDisplayItem foodItem={data}></FoodItemDisplayItem>;
    }

    return (
        <Authorize>
            <div>
                <Title>Menu Details</Title>
                <Link href='/'>Return to Index</Link>

                <h2 className='mb-5 text-3xl'>Menu Details</h2>
                {renderGrid()}
            </div>
        </Authorize>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
