import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { CheckoutModel, GripFoodBackEndClient, Restaurant } from '@/functions/swagger/GripFoodBackEnd';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import { Page } from '@/types/Page';
import { faEdit, faPlus, faRemove } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Modal } from 'antd';
import Link from 'next/link';
import useSwr from 'swr';
import { useRouter } from 'next/router';

const CheckoutTableRow: React.FC<{
    checkout: CheckoutModel,
    onDeleted: () => void
}> = ({ checkout, onDeleted }) => {

    function onClickDelete() {
        Modal.confirm({
            title: `Confirm Delete`,
            content: `Delete Food ${checkout.name}? from Cart`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                if (!checkout?.id) {
                    return;
                }

                try {
                    const client = new GripFoodBackEndClient('http://localhost:3000/api/be');
                    await client.deleteCartDetails(checkout.id);
                    onDeleted();
                } catch (err) {
                    console.error(err);
                    // feedbacknya bisa pakai antd notification
                }
            },
        });
    }


    return (
        <tr>
            <td className="border px-4 py-2">{checkout.id}</td>
            <td className="border px-4 py-2">{checkout.name}</td>
            <td className="border px-4 py-2">{checkout.price}</td>
            <td className="border px-4 py-2">{checkout.qty}</td>
            <td className="border px-4 py-2">{checkout.subTotal}</td>
            <td className="border px-4 py-2">
                <Link href={`/checkout/edit/${checkout.id}`} className="inline-block py-1 px-2 text-xs bg-blue-500 text-white rounded-lg">
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
    const router = useRouter();
    const { id } = router.query;

    const swrFetcher = useSwrFetcherWithAccessToken();
    const { data, error, mutate } = useSwr<Restaurant[]>(`/api/be/api/Carts/${id}`, swrFetcher);

    return (
        <div>
            <Title>Checkout</Title>
            <h2 className='mb-5 text-3xl'>Checkout</h2>

            {Boolean(error) && <Alert type='error' message='Cannot get restaurants data' description={String(error)}></Alert>}
            <table className='table-auto mt-5'>
                <thead className='bg-slate-700 text-white'>
                    <tr>
                        <th className='px-4 py-2'>ID</th>
                        <th className='px-4 py-2'>Name</th>
                        <th className='px-4 py-2'>Price</th>
                        <th className='px-4 py-2'>Quantity</th>
                        <th className='px-4 py-2'>Subtotal</th>
                        <th className='px-4 py-2'></th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((x, i) => <CheckoutTableRow key={i} checkout={x} onDeleted={() => mutate()}></CheckoutTableRow>)}
                </tbody>
            </table>
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;
